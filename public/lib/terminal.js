const fs = require('fs')
const { ipcMain } = require('electron')
const pty = require('node-pty')

const { LOCAL_STORE_CWD } = require('../constants')
const strategyWorkspace = require('./strategyWorkspace')

// id (renderer-generated) -> pty process
const terminals = new Map()

const getDefaultShell = () => {
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'powershell.exe'
  }
  return process.env.SHELL || '/bin/bash'
}

// When the app itself is launched from a Claude Code shell (common during
// development), the inherited env carries nested-session markers — notably
// CLAUDE_CODE_CHILD_SESSION — which make the `claude` CLI inside the terminal
// treat itself as a child session and skip persisting its history, so
// `claude --resume` never finds anything. Strip the whole family so the
// terminal always behaves like a fresh top-level shell.
const buildEnv = () => {
  const env = { ...process.env, TERM: 'xterm-256color' }
  Object.keys(env).forEach((key) => {
    if (key === 'CLAUDECODE' || key.startsWith('CLAUDE_CODE_')) {
      delete env[key]
    }
  })
  return env
}

// Always open in the stable strategy-workspaces root (not the per-strategy id
// folder) so the cwd does not change between sessions/strategies — this keeps
// Claude CLI session history and `claude --resume` working. The active
// strategy is reachable via the `current` symlink maintained on sync.
const resolveCwd = () => {
  const root = strategyWorkspace.getWorkspacesRoot()
  try {
    fs.mkdirSync(root, { recursive: true })
    return root
  } catch (e) {
    return LOCAL_STORE_CWD
  }
}

const killTerminal = (id) => {
  const term = terminals.get(id)
  if (!term) {
    return
  }
  try {
    term.kill()
  } catch (e) {
    // process may already be gone
  }
  terminals.delete(id)
}

const killAllTerminals = () => {
  [...terminals.keys()].forEach(killTerminal)
}

// getMainWindow: () => BrowserWindow | null
const registerTerminalHandlers = (getMainWindow) => {
  const send = (channel, payload) => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }

  ipcMain.on('terminal.create', (_, {
    id, strategyId, cols, rows,
  } = {}) => {
    if (!id || terminals.has(id)) {
      return
    }

    let term
    try {
      term = pty.spawn(getDefaultShell(), [], {
        name: 'xterm-256color',
        cols: cols || 80,
        rows: rows || 24,
        cwd: resolveCwd(strategyId),
        env: buildEnv(),
      })
    } catch (e) {
      send('terminal.exit', { id, error: e.message })
      return
    }

    terminals.set(id, term)

    term.onData((data) => send('terminal.data', { id, data }))
    term.onExit(({ exitCode }) => {
      terminals.delete(id)
      send('terminal.exit', { id, exitCode })
    })
  })

  ipcMain.on('terminal.input', (_, { id, data } = {}) => {
    const term = terminals.get(id)
    if (term) {
      term.write(data)
    }
  })

  ipcMain.on('terminal.resize', (_, { id, cols, rows } = {}) => {
    const term = terminals.get(id)
    if (term && cols > 0 && rows > 0) {
      try {
        term.resize(cols, rows)
      } catch (e) {
        // ignore invalid resize while the pty is tearing down
      }
    }
  })

  ipcMain.on('terminal.kill', (_, { id } = {}) => killTerminal(id))
}

module.exports = {
  registerTerminalHandlers,
  killAllTerminals,
}
