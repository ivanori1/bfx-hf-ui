// Headless test of the strategy workspace file mirror + watcher.
// Run with: node test/strategyWorkspace.test.js
//
// Proves the main-process side of the terminal sync feature:
// - external edits to section files (direct, via the `current` symlink, and
//   atomic write-temp+rename saves) emit onChange with the new content
// - our own syncToFiles writes are echo-suppressed and do NOT emit

const assert = require('assert')
const fs = require('fs')
const fsp = require('fs/promises')
const os = require('os')
const path = require('path')

const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-strategy-workspaces-'))
process.env.HF_STRATEGY_WORKSPACES_CWD = ROOT

// require AFTER setting the env override — constants.js reads it at load time
// eslint-disable-next-line import/no-dynamic-require
const workspace = require('../public/lib/strategyWorkspace')

const STRATEGY_ID = 'test-strategy'
const SECTION_FILE = path.join(ROOT, STRATEGY_ID, 'sections', 'onEnter.js')
const SECTION_FILE_VIA_SYMLINK = path.join(ROOT, 'current', 'sections', 'onEnter.js')

const changes = []

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })

const waitForChange = async (fromCount, timeout = 3000) => {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (changes.length > fromCount) {
      return changes[changes.length - 1]
    }
    await sleep(50) // eslint-disable-line no-await-in-loop
  }
  return null
}

const run = async () => {
  await workspace.syncToFiles(
    STRATEGY_ID,
    { onEnter: 'return false' },
    { label: 'Test strategy' },
  )

  assert.strictEqual(
    fs.readFileSync(SECTION_FILE, 'utf-8'),
    'return false',
    'syncToFiles materialises section content on disk',
  )
  assert.strictEqual(
    fs.readFileSync(SECTION_FILE_VIA_SYMLINK, 'utf-8'),
    'return false',
    'current symlink points at the active strategy',
  )

  workspace.startWatch(STRATEGY_ID, (id, content) => {
    changes.push({ id, content })
  })
  await sleep(500) // let chokidar finish its initial scan

  // 1. our own write (editor -> files) must be suppressed
  await workspace.syncToFiles(
    STRATEGY_ID,
    { onEnter: 'return true // from-editor' },
    { label: 'Test strategy' },
  )
  const echo = await waitForChange(0, 1500)
  assert.strictEqual(echo, null, 'self-writes are echo-suppressed')

  // 2. genuine external edit (direct write, as a CLI tool would do)
  await fsp.writeFile(SECTION_FILE, 'return true // edited-externally', 'utf-8')
  const external = await waitForChange(0)
  assert.ok(external, 'external edit emits onChange')
  assert.strictEqual(external.id, STRATEGY_ID)
  assert.strictEqual(external.content.onEnter, 'return true // edited-externally')

  // 3. external edit through the `current` symlink (how the terminal edits)
  await fsp.writeFile(SECTION_FILE_VIA_SYMLINK, 'return true // via-symlink', 'utf-8')
  const viaSymlink = await waitForChange(1)
  assert.ok(viaSymlink, 'edit via current symlink emits onChange')
  assert.strictEqual(viaSymlink.content.onEnter, 'return true // via-symlink')

  // 4. atomic save (write temp + rename), as editors and some CLIs do
  const tmpFile = `${SECTION_FILE}.tmp`
  await fsp.writeFile(tmpFile, 'return true // atomic-save', 'utf-8')
  await fsp.rename(tmpFile, SECTION_FILE)
  const atomic = await waitForChange(2)
  assert.ok(atomic, 'atomic write-temp+rename emits onChange')
  assert.strictEqual(atomic.content.onEnter, 'return true // atomic-save')

  // 5. the emitted content is adopted as known — no duplicate follow-up event
  const dupe = await waitForChange(3, 1000)
  assert.strictEqual(dupe, null, 'no duplicate events after an external edit')

  await workspace.stopAllWatchers()
  await fsp.rm(ROOT, { recursive: true, force: true })
  console.log('strategyWorkspace test: all assertions passed')
}

run().catch(async (err) => {
  await workspace.stopAllWatchers()
  console.error(err)
  process.exit(1)
})
