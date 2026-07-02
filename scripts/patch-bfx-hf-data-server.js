// Patches for bfx-hf-data-server@5.0.0 (git-pinned, upstream unmaintained).
// Idempotent; runs from postinstall so a reinstall of the git dep re-applies
// them. Each patch fails loudly if the expected code is missing, so an
// upstream change can't silently drop a fix.
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../node_modules/bfx-hf-data-server')

const PATCHES = [
  {
    // The trades backtest fetcher still uses the legacy positional
    // RESTv2#trades signature, but the bundled bfx-api-node-rest@5.5.0
    // expects an object param — the numeric offset lands in the `cb` slot and
    // every trades-based backtest fails with "_makePublicRequest cb param
    // must be a function (code: 600)". The candles fetcher in the same file
    // already uses the object form.
    name: 'trades fetcher RESTv2 v5 signature',
    file: 'lib/bt/fetch_data.js',
    find: 'rest.trades.bind(rest, symbol, offset, end, limit, sort)',
    replace: `rest.trades.bind(rest, {
        symbol, start: offset, end, limit, sort
      })`,
  },
  {
    // The semaphore's rate-limit cooldown matches the legacy error text
    // ("ratelimit"), but bfx-api-node-rest@5.5.0 throws "HTTP code 429 Too
    // Many Requests" — so the cooldown never engaged and rate-limited chunks
    // burned their 3 instant retries and failed the whole backtest.
    name: 'semaphore 429 detection',
    file: 'lib/bt/request_semaphore.js',
    find: "if (err.message.includes('ratelimit')) {",
    replace: "if (err.message.includes('ratelimit') || err.message.includes('429')) {",
  },
  {
    // 90 req/min is ~3x what Bitfinex public hist endpoints allow, making
    // sustained trades pagination trip HTTP 429 constantly. 30/min stays
    // under the documented limits; candle backtests need only a handful of
    // requests so they are unaffected in practice.
    name: 'request budget within public API limits',
    file: 'lib/bt/constants.js',
    find: 'const MAX_REQUESTS_PER_MINUTE = 90',
    replace: 'const MAX_REQUESTS_PER_MINUTE = 30',
  },
]

let failed = false

PATCHES.forEach(({
  name, file, find, replace,
}) => {
  const target = path.join(ROOT, file)
  let src
  try {
    src = fs.readFileSync(target, 'utf-8')
  } catch (e) {
    console.warn(`patch-bfx-hf-data-server: ${file} not found, skipping "${name}"`)
    return
  }

  if (src.includes(replace)) {
    console.log(`patch-bfx-hf-data-server: "${name}" already applied`)
  } else if (src.includes(find)) {
    fs.writeFileSync(target, src.replace(find, replace), 'utf-8')
    console.log(`patch-bfx-hf-data-server: applied "${name}"`)
  } else {
    console.error(
      `patch-bfx-hf-data-server: expected code for "${name}" not found in `
      + `${file} — upstream changed, verify backtests still work and update this patch`,
    )
    failed = true
  }
})

process.exit(failed ? 1 : 0)
