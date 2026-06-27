/** URL-hash helpers for deep-linking to a selected event. Pure. */

const PREFIX = '#event-'

/** The event id encoded in a location hash, or null if none/!match. */
export function eventIdFromHash(hash: string | null | undefined): string | null {
  if (!hash) return null
  const h = hash.startsWith('#') ? hash : `#${hash}`
  if (!h.startsWith(PREFIX)) return null
  const id = decodeURIComponent(h.slice(PREFIX.length))
  return id.length > 0 ? id : null
}

/** The location hash for an event id (round-trips with {@link eventIdFromHash}). */
export function hashForEvent(id: string): string {
  return `${PREFIX}${encodeURIComponent(id)}`
}

/** Absolute shareable deep-link to an event (origin + path + event hash). */
export function eventShareUrl(origin: string, pathname: string, id: string): string {
  return `${origin}${pathname}${hashForEvent(id)}`
}
