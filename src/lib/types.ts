export type AnnType = 'strike' | 'threat' | 'ceasefire' | 'market-jawbone'

export interface Announcement {
  id: string
  datetime: string // ISO 8601 with ET offset
  source: string
  quote: string
  summary: string
  type: AnnType
  citationUrl: string
  citationLabel: string
}

export type Category = 'index' | 'oil' | 'defense' | 'energy' | 'safe-haven'

export interface Point {
  datetime: string
  price: number
  pctFromPrevClose: number
}

export interface Series {
  ticker: string
  name: string
  category: Category
  points: Point[]
}

export interface Reaction {
  announcementId: string
  ticker: string
  deltaPct: number | null
  fromPrice: number | null
  toPrice: number | null
  windowMins: number
}

export interface CorrelatedEvent {
  announcement: Announcement
  reactions: Reaction[]
}
