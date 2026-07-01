const os = require('os')

const LOG_PATH = `${os.tmpdir()}/bfx-hf-ui-logs`
const LOG_PATH_DS_BITFINEX = `${LOG_PATH}/ds-bitfinex-server.log`
const LOG_PATH_API_SERVER = `${LOG_PATH}/api-server.log`

const SCRIPT_PATH = `${__dirname}/../scripts`
const SCRIPT_PATH_DS_BITFINEX = `${SCRIPT_PATH}/start-ds-bitfinex.js`
const SCRIPT_PATH_API_SERVER = `${SCRIPT_PATH}/start-api-server.js`

const LOCAL_STORE_CWD = `${os.homedir()}/.bitfinexhoney`

// Per-strategy on-disk workspaces used by the strategy-aware terminal. Each
// strategy's code sections are mirrored here as files so CLI tools (e.g. the
// `claude` CLI) can read/write them, and a watcher syncs edits back into the app.
const STRATEGY_WORKSPACES_CWD = `${LOCAL_STORE_CWD}/strategy-workspaces`

const ELECTRON_CONTEXT_ALLOWED_URLS = ['https://app.eu.pendo.io']

module.exports = {
  LOG_PATH,
  LOG_PATH_DS_BITFINEX,
  LOG_PATH_API_SERVER,
  SCRIPT_PATH,
  SCRIPT_PATH_DS_BITFINEX,
  SCRIPT_PATH_API_SERVER,
  LOCAL_STORE_CWD,
  STRATEGY_WORKSPACES_CWD,
  ELECTRON_CONTEXT_ALLOWED_URLS,
}
