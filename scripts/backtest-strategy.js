// Headless backtest runner for on-disk strategy workspaces — the same folders
// the in-app terminal edits (~/.bitfinexhoney/strategy-workspaces/<id>). Uses
// the exact engine wiring of the app's data server (exec_strategy), minus the
// websocket/db layers, so results match the in-app backtester. Public market
// data only; no API keys required.
//
// usage: node scripts/backtest-strategy.js <workspace-dir> [options]
//   --from <date|ms>   range start (default: 7 days ago)
//   --to <date|ms>     range end (default: now)
//   --capital <n>      capital allocation (default: 1000)
//   --seed <n>         indicator seed candles (default: 150)
//   --trades           include real trades in the run (slower, more accurate)
//   --json             dump the full results object as JSON

/* eslint-disable import/no-extraneous-dependencies -- all resolved via the
   git-pinned bfx-hf-* dependencies already in the tree */
const fs = require('fs')
const path = require('path')

const { execOffline } = require('bfx-hf-backtest')
const HFS = require('bfx-hf-strategy')
const Indicators = require('bfx-hf-indicators')
const { PriceFeed, PerformanceManager } = require('bfx-hf-strategy-perf')
const { RESTv2 } = require('bfx-api-node-rest')
const parseStrategy = require('bfx-hf-strategy/lib/util/parse_strategy')
const generateResults = require('bfx-hf-strategy/lib/util/generate_strategy_results')

const DataPointFeed = require('bfx-hf-data-server/lib/bt/data_feed')
const DataPointStream = require('bfx-hf-data-server/lib/bt/data_stream')
const ExecutionContext = require('bfx-hf-data-server/lib/bt/context')
const RequestSemaphore = require('bfx-hf-data-server/lib/bt/request_semaphore')
const seedCandlesFactory = require('bfx-hf-data-server/lib/bt/seed_candles')
const getDerivativesConfig = require('bfx-hf-data-server/lib/util/get_derivatives_config')
const {
  fetchCandles: fetchCandlesFactory,
  fetchTrades: fetchTradesFactory,
} = require('bfx-hf-data-server/lib/bt/fetch_data')

const STUB_MARKER = 'this strategy hook is currently empty'

const parseArgs = (argv) => {
  const [workspace] = argv.filter((a) => !a.startsWith('--'))
  const flag = (name) => argv.includes(`--${name}`)
  const opt = (name, fallback) => {
    const i = argv.indexOf(`--${name}`)
    return i !== -1 && argv[i + 1] !== undefined ? argv[i + 1] : fallback
  }
  const ts = (v, fallback) => {
    if (v === undefined) return fallback
    const n = Number(v)
    if (Number.isFinite(n)) return n
    const parsed = Date.parse(v)
    if (!Number.isFinite(parsed)) {
      console.error(`invalid date: ${v}`)
      process.exit(1)
    }
    return parsed
  }

  const now = Date.now()
  return {
    workspace,
    from: ts(opt('from'), now - 7 * 24 * 60 * 60 * 1000),
    to: ts(opt('to'), now),
    capital: Number(opt('capital', 1000)),
    seed: Number(opt('seed', 150)),
    includeTrades: flag('trades'),
    json: flag('json'),
  }
}

const readWorkspace = (dir) => {
  const metaPath = path.join(dir, 'strategy.json')
  const sectionsPath = path.join(dir, 'sections')
  if (!fs.existsSync(metaPath) || !fs.existsSync(sectionsPath)) {
    console.error(`${dir} is not a strategy workspace (needs strategy.json + sections/)`)
    process.exit(1)
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
  const strategyContent = {}
  fs.readdirSync(sectionsPath)
    .filter((f) => f.endsWith('.js'))
    .forEach((f) => {
      const body = fs.readFileSync(path.join(sectionsPath, f), 'utf-8')
      if (body.trim() && !body.includes(STUB_MARKER)) {
        strategyContent[path.basename(f, '.js')] = body
      }
    })

  return { meta, strategyContent }
}

const fmtTime = (mts) => (mts ? new Date(mts).toISOString().replace('T', ' ').slice(0, 19) : '--')
const fmtNum = (v, dp = 2) => {
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(dp) : String(v)
}

const printResults = (res, meta, from, to) => {
  const positions = Object.values(res.strategy.closedPositions || {})

  console.log('')
  console.log(`Backtest: ${meta.label || 'Untitled'} — ${meta.symbol} ${meta.timeframe}`)
  console.log(`Range:    ${fmtTime(from)} -> ${fmtTime(to)}`)
  console.log('')
  console.log(`Candles: ${res.nCandles}  Trades: ${res.nStrategyTrades}  Positions: ${positions.length}  (open at end: ${res.nOpens})`)
  console.log(`Gains/Losses: ${res.nGains}/${res.nLosses}  Profit factor: ${fmtNum(res.profitFactor)}`)
  console.log(`Return: ${fmtNum(res.return)} (${fmtNum(res.returnPerc)}%)  Drawdown: ${fmtNum(res.drawdown)}%`)
  console.log(`Largest gain: ${fmtNum(res.largestGain)}  Largest loss: ${fmtNum(res.largestLoss)}  Volume: ${fmtNum(res.vol)}`)
  console.log('')

  if (positions.length === 0) {
    console.log('No closed positions.')
    return
  }

  console.log('Entry At             | Left At              | Entry     | Close     | Amount  | P/L')
  console.log('---------------------+----------------------+-----------+-----------+---------+---------')
  positions
    .sort((a, b) => (a.entryAt || 0) - (b.entryAt || 0))
    .forEach((p) => {
      console.log([
        fmtTime(p.entryAt).padEnd(20),
        fmtTime(p.closedAt).padEnd(20),
        fmtNum(p.entryPrice).padStart(9),
        fmtNum(p.closingPrice).padStart(9),
        fmtNum(p.amount, 4).padStart(7),
        fmtNum(p.realizedPnl, 4).padStart(8),
      ].join(' | '))
    })
}

const main = async () => {
  const {
    workspace, from, to, capital, seed, includeTrades, json,
  } = parseArgs(process.argv.slice(2))

  if (!workspace) {
    console.error('usage: node scripts/backtest-strategy.js <workspace-dir> [--from d] [--to d] [--capital n] [--seed n] [--trades] [--json]')
    process.exit(1)
  }

  const dir = fs.realpathSync(path.resolve(workspace))
  const { meta, strategyContent } = readWorkspace(dir)
  const { symbol, timeframe } = meta
  const margin = !!(meta.strategyOptions && meta.strategyOptions.margin)

  if (!symbol || !timeframe) {
    console.error('strategy.json is missing symbol/timeframe')
    process.exit(1)
  }

  let strategy = parseStrategy(strategyContent)

  const priceFeed = new PriceFeed()
  const perfManager = new PerformanceManager(priceFeed, { allocation: capital })

  strategy = HFS.define({
    ...strategy,
    tf: timeframe,
    symbol,
    indicators: strategy.defineIndicators ? strategy.defineIndicators(Indicators) : {},
    priceFeed,
    perfManager,
  })

  const rest = new RESTv2({ transform: true })
  const semaphore = new RequestSemaphore()
  const context = new ExecutionContext()
  const dataPointFeed = new DataPointFeed()

  const fetchCandles = fetchCandlesFactory(rest, semaphore, { symbol, timeframe })
  dataPointFeed.addStream(new DataPointStream(fetchCandles))
  if (includeTrades) {
    dataPointFeed.addStream(new DataPointStream(fetchTradesFactory(rest, semaphore, { symbol })))
  }

  const symbolConfig = await getDerivativesConfig(symbol)

  let lastReported = -1
  const reportProgress = (mts) => {
    const perc = Math.floor(((mts - from) / (to - from)) * 10) * 10
    if (perc > lastReported) {
      lastReported = perc
      process.stderr.write(`\rprogress: ${Math.min(perc, 100)}%   `)
    }
  }

  console.error(`Fetching ${symbol} ${timeframe} data and running backtest (paced at 30 req/min)...`)

  const btState = await execOffline(strategy, {
    start: from,
    end: to,
    includeCandles: true,
    includeTrades,
    candleSeed: seed,
    seedCandles: seedCandlesFactory({
      symbol, timeframe, fetchCandles, start: from, candleSeed: seed,
    }),
    priceFeed,
    perfManager,
    context,
    dataPointFeed,
    reportError: (err) => {
      process.stderr.write('\n')
      console.error('backtest error:', err.message)
      process.exitCode = 1
    },
    reportProgress,
    margin,
    isDerivative: !!symbolConfig,
    maxLeverage: symbolConfig ? symbolConfig.maxLeverage : 0,
    useMaxLeverage: false,
    increaseLeverage: false,
    leverage: 0,
    addStopOrder: false,
    stopOrderPercent: 0,
  })

  process.stderr.write('\rprogress: 100%   \n')

  const { nCandles, nTrades, strategy: finalStrategy = {} } = btState
  const res = generateResults(perfManager, { ...finalStrategy, nCandles, nTrades })

  if (json) {
    console.log(JSON.stringify(res, null, 2))
  } else {
    printResults(res, meta, from, to)
  }

  context.close()
  priceFeed.close()
  perfManager.close()
  process.exit(process.exitCode || 0)
}

main().catch((e) => {
  console.error('fatal:', e.message)
  process.exit(1)
})
