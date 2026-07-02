// Patch bfx-hf-data-server@5.0.0 (git-pinned, upstream unmaintained): its
// trades backtest fetcher still uses the legacy positional RESTv2#trades
// signature, but the bundled bfx-api-node-rest@5.5.0 expects an object param —
// the numeric offset lands in the `cb` slot and every trades-based backtest
// fails with "_makePublicRequest cb param must be a function (code: 600)".
// The candles fetcher in the same file already uses the object form.
// Idempotent; runs from postinstall so a reinstall of the git dep re-applies it.
const fs = require('fs')
const path = require('path')

const FILE = path.resolve(
  __dirname,
  '../node_modules/bfx-hf-data-server/lib/bt/fetch_data.js',
)

const BROKEN = 'rest.trades.bind(rest, symbol, offset, end, limit, sort)'
const FIXED = `rest.trades.bind(rest, {
        symbol, start: offset, end, limit, sort
      })`

let src
try {
  src = fs.readFileSync(FILE, 'utf-8')
} catch (e) {
  console.warn(`patch-bfx-hf-data-server: ${FILE} not found, skipping`)
  process.exit(0)
}

if (src.includes(FIXED)) {
  console.log('patch-bfx-hf-data-server: already applied')
} else if (src.includes(BROKEN)) {
  fs.writeFileSync(FILE, src.replace(BROKEN, FIXED), 'utf-8')
  console.log('patch-bfx-hf-data-server: applied trades signature fix')
} else {
  console.error(
    'patch-bfx-hf-data-server: expected code not found — upstream changed, '
    + 'verify trades backtests still work and update this patch',
  )
  process.exit(1)
}
