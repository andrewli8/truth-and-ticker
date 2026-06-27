import announcementsJson from './announcements.json'
import marketsJson from './markets.json'
import type { Announcement, Series } from '../lib/types'

export const announcements: Announcement[] = announcementsJson as Announcement[]
export const markets: Series[] = marketsJson as Series[]
