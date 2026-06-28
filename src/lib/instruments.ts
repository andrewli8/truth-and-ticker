/** A charted instrument: its series ticker and human-facing name. */
export interface Instrument {
  ticker: string
  name: string
}

/**
 * The instruments the piece charts, in display order. Single source of truth shared by
 * the main timeline switcher (App) and the one-screen POC.
 */
export const INSTRUMENTS: Instrument[] = [
  { ticker: 'SPX', name: 'S&P 500' },
  { ticker: 'NDX', name: 'Nasdaq' },
  { ticker: 'CL', name: 'Oil' },
  { ticker: 'LMT', name: 'Defense' },
  { ticker: 'GLD', name: 'Gold' },
  { ticker: 'VIX', name: 'VIX' },
]
