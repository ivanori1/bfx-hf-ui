const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const chokidar = require('chokidar')

const {
  STRATEGY_WORKSPACES_CWD,
  LOG_PATH_DS_BITFINEX,
  LOG_PATH_API_SERVER,
} = require('../constants')

// Mirrors STRATEGY_IDE_SECTIONS from
// bfx-hf-ui-core/src/components/StrategyEditor/StrategyEditor.helpers.js
// Keep in sync with the renderer if new hooks are added.
const STRATEGY_SECTIONS = [
  'defineIndicators',
  'defineMeta',
  'onPriceUpdate',
  'onEnter',
  'onUpdate',
  'onUpdateLong',
  'onUpdateShort',
  'onUpdateClosing',
  'onPositionOpen',
  'onPositionUpdate',
  'onPositionClose',
  'onStart',
  'onStop',
]

const SECTION_STUB = (section) => `// ${section} — this strategy hook is currently empty.
// Add your code below; it will sync back into the Honey strategy editor.
`

// Per-strategy in-memory view of the section contents we last reconciled with
// disk. Used to suppress echo events: when we write files ourselves we update
// this map, so the resulting watcher event is recognised as our own write and
// ignored. Only genuine external edits (e.g. by the `claude` CLI) are emitted.
const knownContent = new Map()
const watchers = new Map()

const getWorkspacePath = (strategyId) => path.join(STRATEGY_WORKSPACES_CWD, strategyId)
const getSectionsPath = (strategyId) => path.join(getWorkspacePath(strategyId), 'sections')
const getSectionFile = (strategyId, section) => path.join(getSectionsPath(strategyId), `${section}.js`)

const readApiDocs = () => {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    return fs.readFileSync(require.resolve('bfx-hf-strategy/docs/api.md'), 'utf-8')
  } catch (e) {
    return ''
  }
}

const generateClaudeMd = (meta = {}) => {
  const {
    label, symbol, timeframe, strategyOptions,
  } = meta
  const apiDocs = readApiDocs()

  const sectionList = STRATEGY_SECTIONS.map((s) => `- \`sections/${s}.js\``).join('\n')

  return `# Honey Framework strategy: ${label || 'Untitled'}

You are helping build an algorithmic trading strategy for the Bitfinex Honey
Framework. The strategy is split into hook files under \`sections/\`. Each file is
one lifecycle hook whose body runs in the strategy engine.

## Rules
- Edit ONLY the files inside \`sections/\`. Do not rename, add or delete them.
- Each file's contents map 1:1 to a strategy section in the app editor; saving a
  file syncs it straight into the running Honey UI.
- \`strategy.json\` is read-only context (symbol, timeframe, options). Do not edit it.
- Keep code in the Honey strategy DSL described below — plain JS using the
  injected helpers (indicators, \`onEnter\`, position helpers, etc.).
- The engine in this build is LONG-ONLY: it rejects any order that would take
  the net position negative ("short positions are not allowed in this
  version"), in backtests and live. Never open short positions
  (\`openShortPositionMarket\` etc.) — on bearish signals close the open long
  instead. Do not try to patch the engine; this is a product limitation.

## Fixing issues in this strategy
This strategy may trade with real funds — work like a careful maintainer, not
a rewriter.

1. **Diagnose first.** Restate the reported issue, read every relevant file
   under \`sections/\` plus \`strategy.json\`, and identify the root cause, not
   just the symptom. If the app showed an error (toasts show only one line),
   read the full stack trace in the data-server log first:
   \`${LOG_PATH_DS_BITFINEX}\`. Signals flow \`defineIndicators\` → \`onPriceUpdate\` /
   \`onUpdate*\` → position helpers; a bad signal usually originates upstream
   of where it is noticed.
2. **Check sibling hooks.** The long/short/closing variants often duplicate
   logic — if one hook has the bug, its siblings probably do too. Fix or flag
   them in the same pass.
3. **Make minimal, surgical edits.** Change only what is broken, match the
   existing style, and do not refactor working code. Guard against indicator
   warm-up and missing values instead of letting a hook throw mid-run.
4. **Verify by reasoning, prescribe a backtest.** Hooks cannot run standalone;
   they execute inside the Honey engine. Hand-check boundary conditions
   (warm-up periods, first/last candle, position-state assumptions), then tell
   the user exactly what to backtest in the app and what outcome confirms the
   fix (e.g. "entries should only occur after a confirmed cross; signal count
   on this symbol/timeframe should drop").
5. **Report clearly.** Summarise the root cause, what changed and why, and any
   expected behaviour change (more/fewer trades, different entry timing). If
   anything was ambiguous, state the assumption you made; in interactive
   sessions ask instead.

Stop and ask rather than guess when the root cause is unclear, when a fix
would change unrelated hooks' behaviour, or when the request implies changing
position sizing or risk parameters.

## This strategy
- Label: ${label || 'Untitled'}
- Symbol: ${symbol || 'not set'}
- Timeframe: ${timeframe || 'not set'}
${strategyOptions ? `- Options: ${JSON.stringify(strategyOptions)}` : ''}

## Sections (hook files)
${sectionList}

## Honey strategy API reference
${apiDocs || '(API docs unavailable in this build — refer to the in-app Help panel.)'}
`
}

const generateRootClaudeMd = () => `# Bitfinex Honey — strategy workspaces

This is the stable working directory for the in-app terminal. It does not change
between sessions, so \`claude --resume\` / \`claude --continue\` work here.

- Each subfolder (named by strategy id) is one strategy's workspace, containing
  \`CLAUDE.md\`, read-only \`strategy.json\`, and editable \`sections/*.js\` hook files.
- \`current/\` is a symlink to the strategy currently open in the app. Start there:
  read \`current/CLAUDE.md\` and edit files under \`current/sections/\` — saving a file
  syncs it straight into the running Honey strategy editor.
- When the user switches strategies in the app, \`current\` repoints; re-read
  \`current/CLAUDE.md\` to pick up the new strategy's context.

## Debugging
If something fails in the app (backtests, strategy execution, connectivity),
the error toast shows only one line — the full stack traces are in the app
logs. Check them before guessing:
- \`${LOG_PATH_DS_BITFINEX}\` — data server: backtest execution, market data
  sync, strategy runtime errors
- \`${LOG_PATH_API_SERVER}\` — API server: auth, orders, exchange connectivity
Recent errors are at the end (\`tail\` them).
`

// Write `content` to `filePath` only when it differs from what's on disk, to
// avoid spurious watcher events. Returns true if a write happened.
const writeIfChanged = async (filePath, content) => {
  try {
    const current = await fsp.readFile(filePath, 'utf-8')
    if (current === content) {
      return false
    }
  } catch (e) {
    // file doesn't exist yet — fall through and write
  }
  await fsp.writeFile(filePath, content, 'utf-8')
  return true
}

const buildContentMap = (strategyContent = {}) => {
  const map = {}
  STRATEGY_SECTIONS.forEach((section) => {
    map[section] = strategyContent[section] || ''
  })
  return map
}

// Point the stable `current` symlink at the active strategy and refresh the
// root CLAUDE.md, so the terminal can stay in one directory (keeping Claude
// session history / --resume intact) while still exposing the live strategy.
const updateCurrentPointer = async (strategyId) => {
  const root = STRATEGY_WORKSPACES_CWD
  await fsp.mkdir(root, { recursive: true })
  await writeIfChanged(path.join(root, 'CLAUDE.md'), generateRootClaudeMd())

  const linkPath = path.join(root, 'current')
  try {
    await fsp.rm(linkPath, { force: true, recursive: true })
    await fsp.symlink(getWorkspacePath(strategyId), linkPath, 'dir')
  } catch (e) {
    // symlinks may be unavailable (e.g. permissions); fall back to a pointer file
    try {
      await writeIfChanged(path.join(root, 'CURRENT_STRATEGY.txt'), `${strategyId}\n`)
    } catch (_e) {
      // best-effort only
    }
  }
}

// Materialise a strategy's sections + context onto disk. Idempotent.
const syncToFiles = async (strategyId, strategyContent = {}, meta = {}) => {
  if (!strategyId) {
    return getWorkspacePath('scratch')
  }

  const workspacePath = getWorkspacePath(strategyId)
  const sectionsPath = getSectionsPath(strategyId)
  await fsp.mkdir(sectionsPath, { recursive: true })

  await writeIfChanged(path.join(workspacePath, 'CLAUDE.md'), generateClaudeMd(meta))
  await writeIfChanged(
    path.join(workspacePath, 'strategy.json'),
    `${JSON.stringify(meta, null, 2)}\n`,
  )

  const contentMap = buildContentMap(strategyContent)
  await Promise.all(
    STRATEGY_SECTIONS.map((section) => {
      const code = contentMap[section]
      const fileBody = code || SECTION_STUB(section)
      return writeIfChanged(getSectionFile(strategyId, section), fileBody)
    }),
  )

  knownContent.set(strategyId, contentMap)
  await updateCurrentPointer(strategyId)
  return workspacePath
}

// Read the section files back into a strategyContent-shaped object. A stub file
// (unchanged placeholder) is treated as empty so it round-trips cleanly.
const readFromFiles = async (strategyId) => {
  const content = {}
  await Promise.all(
    STRATEGY_SECTIONS.map(async (section) => {
      try {
        const body = await fsp.readFile(getSectionFile(strategyId, section), 'utf-8')
        content[section] = body === SECTION_STUB(section) ? '' : body
      } catch (e) {
        content[section] = ''
      }
    }),
  )
  return content
}

const contentEquals = (a = {}, b = {}) => STRATEGY_SECTIONS
  .every((section) => (a[section] || '') === (b[section] || ''))

const startWatch = (strategyId, onChange) => {
  if (!strategyId || watchers.has(strategyId)) {
    return
  }

  let debounceRef = null
  const watcher = chokidar.watch(`${getSectionsPath(strategyId)}/*.js`, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
  })

  const handleChange = () => {
    if (debounceRef) {
      clearTimeout(debounceRef)
    }
    debounceRef = setTimeout(async () => {
      const content = await readFromFiles(strategyId)
      const known = knownContent.get(strategyId)
      // Ignore echoes of our own writes; only emit genuine external edits.
      if (known && contentEquals(content, known)) {
        return
      }
      knownContent.set(strategyId, buildContentMap(content))
      onChange(strategyId, content)
    }, 250)
  }

  watcher.on('change', handleChange)
  watcher.on('add', handleChange)
  watchers.set(strategyId, watcher)
}

const stopWatch = async (strategyId) => {
  const watcher = watchers.get(strategyId)
  if (watcher) {
    await watcher.close()
    watchers.delete(strategyId)
  }
}

const stopAllWatchers = async () => {
  await Promise.all([...watchers.keys()].map((id) => stopWatch(id)))
}

module.exports = {
  STRATEGY_SECTIONS,
  getWorkspacePath,
  getWorkspacesRoot: () => STRATEGY_WORKSPACES_CWD,
  syncToFiles,
  readFromFiles,
  startWatch,
  stopWatch,
  stopAllWatchers,
}
