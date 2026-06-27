// Transforms raw daily closes (from the fetch agent) into src/data/markets.json
// in our schema, computing pctFromPrevClose so the consistency test holds.
//
// Usage: node scripts/build-markets.mjs [/tmp/marketdata.json]
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = process.argv[2] ?? '/tmp/marketdata.json'

const META = {
  SPX: { name: 'S&P 500', category: 'index' },
  DJI: { name: 'Dow Jones Industrial Average', category: 'index' },
  NDX: { name: 'Nasdaq Composite', category: 'index' },
  VIX: { name: 'CBOE Volatility Index', category: 'volatility' },
  CL: { name: 'WTI Crude Oil', category: 'oil' },
  BRENT: { name: 'Brent Crude Oil', category: 'oil' },
  LMT: { name: 'Lockheed Martin', category: 'defense' },
  RTX: { name: 'RTX (Raytheon)', category: 'defense' },
  XOM: { name: 'Exxon Mobil', category: 'energy' },
  GLD: { name: 'SPDR Gold Shares', category: 'safe-haven' },
  GOLD: { name: 'Gold (spot, per oz)', category: 'safe-haven' },
}

// US Eastern offset for a YYYY-MM-DD date in 2025 (EDT Mar 9–Nov 1, else EST).
function offsetFor(date) {
  const dstStart = Date.parse('2025-03-09')
  const dstEnd = Date.parse('2025-11-02')
  const t = Date.parse(date)
  return t >= dstStart && t < dstEnd ? '-04:00' : '-05:00'
}

const round = (n) => Math.round(n * 100) / 100

const raw = JSON.parse(readFileSync(SRC, 'utf8'))
const series = []

for (const [ticker, rows] of Object.entries(raw)) {
  if (ticker.startsWith('_') || !Array.isArray(rows)) continue
  const meta = META[ticker]
  if (!meta) {
    console.warn(`No metadata for ${ticker}, skipping`)
    continue
  }
  const sorted = [...rows]
    .filter((r) => Array.isArray(r) && r.length >= 2 && Number.isFinite(Number(r[1])))
    .sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))

  const points = sorted.map(([date, close], i) => {
    const price = round(Number(close))
    const prev = i > 0 ? Number(sorted[i - 1][1]) : null
    const pct = i === 0 || !prev ? 0 : round(((price - prev) / prev) * 100)
    return { datetime: `${date}T16:00:00${offsetFor(date)}`, price, pctFromPrevClose: pct }
  })

  if (points.length) series.push({ ticker, name: meta.name, category: meta.category, points })
}

// Stable order: indices, oil, defense, energy, safe-haven, volatility
const ORDER = ['SPX', 'DJI', 'NDX', 'CL', 'BRENT', 'LMT', 'RTX', 'XOM', 'GLD', 'GOLD', 'VIX']
series.sort((a, b) => ORDER.indexOf(a.ticker) - ORDER.indexOf(b.ticker))

writeFileSync(
  new URL('../src/data/markets.json', import.meta.url),
  JSON.stringify(series, null, 2) + '\n',
)
console.log(
  `Wrote ${series.length} series, ${series.reduce((s, x) => s + x.points.length, 0)} points:`,
  series.map((s) => `${s.ticker}(${s.points.length})`).join(' '),
)
