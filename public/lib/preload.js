const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electronService',
  {
    sendAppClosedEvent: () => ipcRenderer.send('app-closed'),
    sendRestartAppEvent: () => ipcRenderer.send('restart_app'),
    sendClearAppUpdateTimerEvent: () => ipcRenderer.send('clear_app_update_timer'),
    sendDownloadUpdateEvent: () => ipcRenderer.send('download_update'),
    sendRestoreAppMessage: () => ipcRenderer.send('app_should_restored'),
    sendChangeFullscreenEvent: (fullscreen) => ipcRenderer.send('app_change_fullscreen', { fullscreen }),

    addAppUpdateAvailableEventListener: (cb) => ipcRenderer.on('update_available', cb),
    addAppUpdateDownloadProgressListener: (cb) => ipcRenderer.on('update_in_progress', cb),
    addAppUpdateDownloadedEventListener: (cb) => ipcRenderer.on('update_downloaded', cb),
    addAppUpdateErrorListener: (cb) => ipcRenderer.on('update_error', cb),

    dumpLogData: (data) => ipcRenderer.send('dump_log_data', data),

    removeAllAppUpdateEventListeners: () => {
      ipcRenderer.removeAllListeners('update_available')
      ipcRenderer.removeAllListeners('update_in_progress')
      ipcRenderer.removeAllListeners('update_downloaded')
      ipcRenderer.removeAllListeners('update_error')
    },

    getAllEvents: () => ipcRenderer.eventNames(),

    addAppCloseEventListener: (cb) => ipcRenderer.on('app-close', cb),
    addOpenSettingsModalListener: (cb) => ipcRenderer.on('open_settings', cb),
    addAppHiddenListener: (cb) => ipcRenderer.on('app_hidden', cb),
    addAppRestoredListener: (cb) => ipcRenderer.on('app_restored', cb),
    addFullscreenChangeListener: (cb) => ipcRenderer.on('app_fullscreen_changed', cb),

    sendSaveAllStrategiesEvent: (strategies) => ipcRenderer.send('app_save_all_strategies.request', { strategies }),
    addSaveAllStrategiesResultListner: (cb) => ipcRenderer.on('app_save_all_strategies.result', cb),
    removeSaveAllStrategiesResultListener: () => ipcRenderer.removeAllListeners('app_save_all_strategies.result'),

    // Strategy-aware terminal (node-pty backed shell in the IDE)
    terminalCreate: ({
      id, strategyId, cols, rows,
    }) => ipcRenderer.send('terminal.create', {
      id, strategyId, cols, rows,
    }),
    terminalInput: (id, data) => ipcRenderer.send('terminal.input', { id, data }),
    terminalResize: (id, cols, rows) => ipcRenderer.send('terminal.resize', { id, cols, rows }),
    terminalKill: (id) => ipcRenderer.send('terminal.kill', { id }),
    addTerminalDataListener: (cb) => ipcRenderer.on('terminal.data', cb),
    addTerminalExitListener: (cb) => ipcRenderer.on('terminal.exit', cb),
    removeTerminalListeners: () => {
      ipcRenderer.removeAllListeners('terminal.data')
      ipcRenderer.removeAllListeners('terminal.exit')
    },

    // Per-strategy on-disk workspace sync (mirrors code sections to files)
    syncStrategyWorkspace: ({ strategyId, strategyContent, meta }) => ipcRenderer.send('strategy_workspace.sync', {
      strategyId, strategyContent, meta,
    }),
    stopStrategyWorkspace: (strategyId) => ipcRenderer.send('strategy_workspace.stop', { strategyId }),
    addStrategyFilesChangedListener: (cb) => ipcRenderer.on('strategy_files.changed', cb),
    removeStrategyFilesChangedListener: () => ipcRenderer.removeAllListeners('strategy_files.changed'),

    removeAllGlobalListeners: () => {
      ipcRenderer.removeAllListeners('app-close')
      ipcRenderer.removeAllListeners('open_settings')
      ipcRenderer.removeAllListeners('app_hidden')
      ipcRenderer.removeAllListeners('app_restored')
      ipcRenderer.removeAllListeners('app_fullscreen_changed')
    },
  },
)
