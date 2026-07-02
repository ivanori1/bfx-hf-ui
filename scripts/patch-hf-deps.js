// Patches for the git-pinned, upstream-unmaintained HF packages
// (bfx-hf-data-server@5.0.0, bfx-hf-strategy@3.0.0, bfx-hf-server@10.1.1).
// Idempotent; runs from postinstall so a reinstall re-applies them. Each patch
// fails loudly if the expected code is missing, so an upstream change can't
// silently drop a fix.
const fs = require('fs')
const path = require('path')

const NM = path.resolve(__dirname, '../node_modules')

const PATCHES = [
  {
    // The trades backtest fetcher still uses the legacy positional
    // RESTv2#trades signature, but the bundled bfx-api-node-rest@5.5.0
    // expects an object param — the numeric offset lands in the `cb` slot and
    // every trades-based backtest fails with "_makePublicRequest cb param
    // must be a function (code: 600)". The candles fetcher in the same file
    // already uses the object form.
    name: 'data-server: trades fetcher RESTv2 v5 signature',
    file: 'bfx-hf-data-server/lib/bt/fetch_data.js',
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
    name: 'data-server: semaphore 429 detection',
    file: 'bfx-hf-data-server/lib/bt/request_semaphore.js',
    find: "if (err.message.includes('ratelimit')) {",
    replace: "if (err.message.includes('ratelimit') || err.message.includes('429')) {",
  },
  {
    // 90 req/min is ~3x what Bitfinex public hist endpoints allow, making
    // sustained trades pagination trip HTTP 429 constantly. 30/min stays
    // under the documented limits; candle backtests need only a handful of
    // requests so they are unaffected in practice.
    name: 'data-server: request budget within public API limits',
    file: 'bfx-hf-data-server/lib/bt/constants.js',
    find: 'const MAX_REQUESTS_PER_MINUTE = 90',
    replace: 'const MAX_REQUESTS_PER_MINUTE = 30',
  },
  {
    // Positions were stamped with the wall-clock time instead of the
    // simulated order's time, so every backtest position showed "Entry At" =
    // the moment the backtest ran. The last opening trade carries the candle
    // mts. Also expose the margin flag on the position object so pnl code can
    // distinguish margin positions (see the margin pnl patch below).
    name: 'strategy: position entryAt from trade mts + margin flag',
    file: 'bfx-hf-strategy/lib/position/create_position_object.js',
    find: `    entryPrice: price,
    entryAt: Date.now()`,
    replace: `    entryPrice: price,
    margin: !!(isDerivative || margin),
    entryAt: (trades.length > 0 && trades[trades.length - 1].mts) || Date.now()`,
  },
  {
    // Same wall-clock issue on close: use the closing trade's mts.
    name: 'strategy: position closedAt from trade mts',
    file: 'bfx-hf-strategy/lib/position/close_position_with_order.js',
    find: 'positionData.closedAt = Date.now()',
    replace: 'positionData.closedAt = trade.mts || Date.now()',
  },
  {
    name: 'strategy: BigNumber import for margin pnl',
    file: 'bfx-hf-strategy/lib/data/update_position_with_trade.js',
    find: "const { calcRealizedTradePnl } = require('../pnl')",
    replace: "const BigNumber = require('bignumber.js')\nconst { calcRealizedTradePnl } = require('../pnl')",
  },
  {
    // Margin positions keep no inventory (create_position_object skips it by
    // design), but closes computed pnl FROM the inventory — empty inventory
    // meant every margin position closed with realizedPnl 0 (fees are the
    // only other term, and fees aren't simulated in backtests). Realize pnl
    // against the position's average entry price on reducing trades instead.
    name: 'strategy: margin position realized pnl',
    file: 'bfx-hf-strategy/lib/data/update_position_with_trade.js',
    find: `  trade.position_id = position.id
  trade.realizedPnl = calcRealizedTradePnl(position.inventory, trade)`,
    replace: `  trade.position_id = position.id

  if (position.margin) {
    const isReduce = (position.amount > 0) !== (trade.amount > 0)
    let pnl = trade.fees ? new BigNumber(trade.fees.cost) : new BigNumber(0)
    if (isReduce) {
      pnl = pnl.plus(
        new BigNumber(trade.price)
          .minus(position.price)
          .multipliedBy(-trade.amount)
      )
    }
    trade.realizedPnl = pnl
  } else {
    trade.realizedPnl = calcRealizedTradePnl(position.inventory, trade)
  }`,
  },
  {
    // On upstream failure the proxy logged the error but never answered, so
    // the chart iframe's candle requests hung forever and the backtest chart
    // stayed empty until reload. Fail fast so the client can retry.
    name: 'server: api proxy responds on upstream failure',
    file: 'bfx-hf-server/lib/bfx_api_proxy.js',
    find: `      } catch (e) {
        console.log(e)
      }`,
    replace: `      } catch (e) {
        console.log(e)
        if (!res.headersSent) {
          res.status(502).json({ error: 'upstream request failed' })
        } else {
          res.end()
        }
      }`,
  },
]

let failed = false

PATCHES.forEach(({
  name, file, find, replace,
}) => {
  const target = path.join(NM, file)
  let src
  try {
    src = fs.readFileSync(target, 'utf-8')
  } catch (e) {
    console.warn(`patch-hf-deps: ${file} not found, skipping "${name}"`)
    return
  }

  if (src.includes(replace)) {
    console.log(`patch-hf-deps: "${name}" already applied`)
  } else if (src.includes(find)) {
    fs.writeFileSync(target, src.replace(find, replace), 'utf-8')
    console.log(`patch-hf-deps: applied "${name}"`)
  } else {
    console.error(
      `patch-hf-deps: expected code for "${name}" not found in `
      + `${file} — upstream changed, verify the fix still applies and update this patch`,
    )
    failed = true
  }
})

process.exit(failed ? 1 : 0)
