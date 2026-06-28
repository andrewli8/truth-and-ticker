import { describe, it, expect } from 'vitest'
import { peakToTroughPct, maxRunupPct, seriesByTicker, spotlightTicker, eventMoves, chartAriaLabel, timelineAriaLabel, netReturnPct, maxDrawdown, reactionByType, topReactions } from '../stats'
import type { Series, CorrelatedEvent, AnnType } from '../types'

function ev(id: string, type: AnnType, spxDelta: number | null): CorrelatedEvent {
  return {
    announcement: {
      id, datetime: '2025-01-01T00:00:00-05:00', source: 'x', quote: '', summary: '',
      type, citationUrl: 'https://e.com', citationLabel: 'e',
    },
    reactions: [
      { announcementId: id, ticker: 'SPX', deltaPct: spxDelta, fromPrice: 1, toPrice: 1, windowMins: 120 },
    ],
  }
}

const s = (ticker: string, prices: number[]): Series => ({
  ticker,
  name: ticker,
  category: 'index',
  points: prices.map((price, i) => ({
    datetime: `2025-06-${12 + i}T16:00:00-04:00`,
    price,
    pctFromPrevClose: 0,
  })),
})

describe('peakToTroughPct', () => {
  it('computes the drawdown from peak to trough', () => {
    // peak 100, trough 80 => -20%
    expect(peakToTroughPct(s('X', [90, 100, 80, 85]))).toBeCloseTo(-20)
  })
  it('returns null on empty series', () => {
    expect(peakToTroughPct({ ...s('X', []), points: [] })).toBeNull()
  })
})

describe('maxRunupPct', () => {
  it('measures the biggest rise from any prior trough, not just from day one', () => {
    // trough 80 (not the first point) → later high 120 ⇒ +50% (first→high would be +20%)
    expect(maxRunupPct(s('X', [100, 80, 120]))).toBeCloseTo(50)
  })
  it('ignores a trough that comes after the high', () => {
    // 100→110 is +10%; the later drop to 70 has no subsequent high to run up to
    expect(maxRunupPct(s('X', [100, 110, 70]))).toBeCloseTo(10)
  })
  it('is 0 for a monotonically falling series', () => {
    expect(maxRunupPct(s('X', [100, 90, 80]))).toBe(0)
  })
  it('returns null for empty', () => {
    expect(maxRunupPct({ ...s('X', []), points: [] })).toBeNull()
  })
})

describe('netReturnPct', () => {
  it('is first→last as a percent', () => {
    expect(netReturnPct(s('X', [100, 80, 106]))).toBeCloseTo(6)
  })
  it('null for empty', () => {
    expect(netReturnPct({ ...s('X', []), points: [] })).toBeNull()
  })
})

describe('maxDrawdown', () => {
  it('is the deepest peak→later-trough decline (negative)', () => {
    // peak 120 then trough 90 ⇒ -25%
    expect(maxDrawdown(s('X', [100, 120, 90, 110]))?.pct).toBeCloseTo(-25)
  })
  it('is 0 for a monotonically rising series', () => {
    expect(maxDrawdown(s('X', [100, 110, 120]))?.pct).toBe(0)
  })
  it('null for empty', () => {
    expect(maxDrawdown({ ...s('X', []), points: [] })).toBeNull()
  })
  it('reports the trough date of the deepest drawdown', () => {
    // peak 120 (Jun 13), trough 90 (Jun 14) ⇒ -25% bottoming on the 14th
    const dd = maxDrawdown(s('X', [100, 120, 90, 110]))
    expect(dd?.pct).toBeCloseTo(-25)
    expect(dd?.troughISO).toContain('2025-06-14')
  })
})

describe('seriesByTicker', () => {
  it('finds a series', () => {
    expect(seriesByTicker([s('A', [1]), s('B', [2])], 'B')?.ticker).toBe('B')
  })
  it('returns undefined when missing', () => {
    expect(seriesByTicker([s('A', [1])], 'Z')).toBeUndefined()
  })
})

describe('spotlightTicker', () => {
  it('oil for market-jawbone', () => expect(spotlightTicker('market-jawbone')).toBe('CL'))
  it('defense for strikes', () => expect(spotlightTicker('strike')).toBe('LMT'))
  it('S&P for threats and ceasefires', () => {
    expect(spotlightTicker('threat')).toBe('SPX')
    expect(spotlightTicker('ceasefire')).toBe('SPX')
  })
  it('Nasdaq for tariffs and trade deals (tech-heavy index)', () => {
    expect(spotlightTicker('tariff')).toBe('NDX')
    expect(spotlightTicker('trade-deal')).toBe('NDX')
  })
})

describe('chartAriaLabel', () => {
  it('states the instrument, window, and first→last move', () => {
    const label = chartAriaLabel(s('SPX', [100, 110]), 'Jan 20')
    expect(label).toContain('SPX')
    expect(label).toContain('Jan 20 window')
    expect(label).toContain('+10.00%')
  })
  it('falls back gracefully for an empty series', () => {
    expect(chartAriaLabel({ ...s('X', []), points: [] })).toBe('X price chart')
  })
  it('appends the event reaction when one is provided', () => {
    const label = chartAriaLabel(s('SPX', [100, 110]), 'Jan 20', 0.88)
    expect(label).toContain('reaction +0.88%')
  })
  it('omits the reaction clause when none is provided', () => {
    expect(chartAriaLabel(s('SPX', [100, 110]), 'Jan 20')).not.toContain('reaction')
    expect(chartAriaLabel(s('SPX', [100, 110]), 'Jan 20', null)).not.toContain('reaction')
  })
})

describe('timelineAriaLabel', () => {
  it('states the series, the span, and the overall move', () => {
    const label = timelineAriaLabel(s('SPX', [100, 120, 110]))
    expect(label).toContain('SPX')
    expect(label).toMatch(/Jun 1[23]/) // first/last dates from the fixture
    expect(label).toContain('+10.00%') // 100 → 110
  })
  it('falls back gracefully for an empty series', () => {
    expect(timelineAriaLabel({ ...s('X', []), points: [] })).toBe('X timeline')
  })
})

describe('eventMoves', () => {
  const event: CorrelatedEvent = {
    announcement: {
      id: 'e', datetime: '2025-06-13T09:30:00-04:00', source: 's', quote: '',
      summary: '', type: 'strike', citationUrl: '', citationLabel: '',
    },
    reactions: [
      { announcementId: 'e', ticker: 'SPX', deltaPct: -1.1, fromPrice: 1, toPrice: 1, windowMins: 120 },
      { announcementId: 'e', ticker: 'CL', deltaPct: 7.3, fromPrice: 1, toPrice: 1, windowMins: 120 },
      { announcementId: 'e', ticker: 'GLD', deltaPct: null, fromPrice: null, toPrice: null, windowMins: 120 },
      { announcementId: 'e', ticker: 'LMT', deltaPct: -3.2, fromPrice: 1, toPrice: 1, windowMins: 120 },
    ],
  }

  it('orders by absolute move, biggest first, nulls last', () => {
    expect(eventMoves(event).map((m) => m.ticker)).toEqual(['CL', 'LMT', 'SPX', 'GLD'])
  })
  it('maps ticker and signed pct through', () => {
    const cl = eventMoves(event).find((m) => m.ticker === 'CL')
    expect(cl?.pct).toBe(7.3)
  })
  it('does not mutate the reactions array', () => {
    const before = event.reactions.map((r) => r.ticker).join(',')
    eventMoves(event)
    expect(event.reactions.map((r) => r.ticker).join(',')).toBe(before)
  })
  it('handles an event with no reactions', () => {
    expect(eventMoves({ ...event, reactions: [] })).toEqual([])
  })
})

describe('reactionByType', () => {
  it('averages the ticker reaction by type, sorted most-positive first, with counts', () => {
    const events = [
      ev('a', 'tariff', -2), ev('b', 'tariff', -4), // tariff avg -3 (n=2)
      ev('c', 'ceasefire', 1.2),                     // ceasefire avg 1.2 (n=1)
      ev('d', 'strike', -1),                         // strike avg -1 (n=1)
    ]
    const out = reactionByType(events, 'SPX')
    expect(out.map((o) => o.type)).toEqual(['ceasefire', 'strike', 'tariff'])
    const tariff = out.find((o) => o.type === 'tariff')!
    expect(tariff.avgPct).toBeCloseTo(-3)
    expect(tariff.count).toBe(2)
  })

  it('ignores null reactions and yields nothing for an absent ticker', () => {
    const events = [ev('a', 'tariff', null), ev('b', 'tariff', -2)]
    const out = reactionByType(events, 'SPX')
    expect(out.find((o) => o.type === 'tariff')!.avgPct).toBeCloseTo(-2)
    expect(out.find((o) => o.type === 'tariff')!.count).toBe(1)
    expect(reactionByType(events, 'ZZZ')).toEqual([])
  })
})

describe('topReactions', () => {
  function evMulti(id: string, day: string, type: AnnType, reactions: { ticker: string; deltaPct: number | null }[]): CorrelatedEvent {
    return {
      announcement: {
        id, datetime: `${day}T00:00:00-05:00`, source: 'x', quote: '', summary: '',
        type, citationUrl: 'https://e.com', citationLabel: 'e',
      },
      reactions: reactions.map((r) => ({
        announcementId: id, ticker: r.ticker, deltaPct: r.deltaPct, fromPrice: 1, toPrice: 1, windowMins: 120,
      })),
    }
  }

  // Distinct days so the ticker+day dedup doesn't collapse across these two events.
  const events = [
    evMulti('a', '2025-01-01', 'tariff', [{ ticker: 'SPX', deltaPct: -2 }, { ticker: 'CL', deltaPct: 8 }, { ticker: 'VIX', deltaPct: 40 }]),
    evMulti('b', '2025-02-01', 'ceasefire', [{ ticker: 'SPX', deltaPct: 1 }, { ticker: 'CL', deltaPct: -6 }, { ticker: 'GLD', deltaPct: null }]),
  ]

  it('ranks (event × instrument) reactions by absolute move, capped at n, nulls skipped', () => {
    const top = topReactions(events, 3)
    expect(top.map((t) => `${t.ticker}:${t.deltaPct}`)).toEqual(['VIX:40', 'CL:8', 'CL:-6'])
    expect(top.every((t) => t.deltaPct !== null)).toBe(true)
    expect(top[0].announcement.id).toBe('a')
  })

  it('honors the exclude list (e.g. drop VIX) and caps at n', () => {
    const top = topReactions(events, 2, ['VIX'])
    expect(top.map((t) => t.ticker)).toEqual(['CL', 'CL']) // 8, then -6
    expect(top).toHaveLength(2)
  })
})

describe('topReactions dedup', () => {
  function ev2(id: string, day: string, ticker: string, delta: number): CorrelatedEvent {
    return {
      announcement: { id, datetime: `${day}T12:00:00-05:00`, source: 'x', quote: '', summary: '', type: 'tariff', citationUrl: 'https://e.com', citationLabel: 'e' },
      reactions: [{ announcementId: id, ticker, deltaPct: delta, fromPrice: 1, toPrice: 1, windowMins: 120 }],
    }
  }
  it('collapses same-day same-ticker reactions to one moment', () => {
    // Two posts on the same day share the same NDX reaction → one entry, not two.
    const evs = [ev2('a', '2025-04-09', 'NDX', 12), ev2('b', '2025-04-09', 'NDX', 12), ev2('c', '2025-04-10', 'NDX', -3)]
    const top = topReactions(evs, 10)
    expect(top.filter((t) => t.ticker === 'NDX' && Math.abs(t.deltaPct) === 12)).toHaveLength(1)
    expect(top).toHaveLength(2) // the +12 moment + the -3 moment
  })
})

describe('topReactions diverse', () => {
  function ev3(id: string, day: string, ticker: string, delta: number): CorrelatedEvent {
    return {
      announcement: { id, datetime: `${day}T12:00:00-05:00`, source: 'x', quote: '', summary: '', type: 'tariff', citationUrl: 'https://e.com', citationLabel: 'e' },
      reactions: [{ announcementId: id, ticker, deltaPct: delta, fromPrice: 1, toPrice: 1, windowMins: 120 }],
    }
  }
  it('keeps each ticker AND each day unique (distinct moments) when diverse', () => {
    const evs = [
      ev3('a', '2025-04-09', 'NDX', 12.16), // biggest
      ev3('b', '2025-04-09', 'SPX', 9.52),  // same DAY as NDX → skipped
      ev3('c', '2025-04-04', 'RTX', -9.81), // new ticker + day → kept
      ev3('d', '2025-04-22', 'RTX', -9.80), // same TICKER as c → skipped
      ev3('e', '2025-06-23', 'CL', -8.57),  // new ticker + day → kept
    ]
    const top = topReactions(evs, 3, [], true)
    expect(top.map((t) => t.ticker)).toEqual(['NDX', 'RTX', 'CL'])
    // no repeated ticker or day
    expect(new Set(top.map((t) => t.ticker)).size).toBe(3)
    expect(new Set(top.map((t) => t.announcement.datetime.slice(0, 10))).size).toBe(3)
  })
})
