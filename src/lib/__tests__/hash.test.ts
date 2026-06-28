import { describe, it, expect } from 'vitest'
import { eventIdFromHash, hashForEvent, eventShareUrl, instrumentFromQuery } from '../hash'

describe('hash deep-linking', () => {
  it('round-trips an id through the hash', () => {
    expect(eventIdFromHash(hashForEvent('ceasefire'))).toBe('ceasefire')
  })
  it('encodes ids that need escaping', () => {
    expect(eventIdFromHash(hashForEvent('a b/c'))).toBe('a b/c')
  })
  it('returns null for non-event or empty hashes', () => {
    expect(eventIdFromHash('')).toBeNull()
    expect(eventIdFromHash('#section')).toBeNull()
    expect(eventIdFromHash('#event-')).toBeNull()
    expect(eventIdFromHash(null)).toBeNull()
  })
  it('tolerates a hash missing its leading #', () => {
    expect(eventIdFromHash('event-x')).toBe('x')
  })
  it('returns null (does not throw) on malformed percent-encoding', () => {
    expect(eventIdFromHash('#event-%')).toBeNull()
    expect(eventIdFromHash('#event-%E0%A4%A')).toBeNull()
  })
  it('builds an absolute shareable deep-link', () => {
    expect(eventShareUrl('https://x.dev', '/', 'ceasefire')).toBe('https://x.dev/#event-ceasefire')
  })
  it('reads an allowed instrument from the query, else null', () => {
    expect(instrumentFromQuery('?i=CL', ['SPX', 'CL'])).toBe('CL')
    expect(instrumentFromQuery('?i=ZZZ', ['SPX', 'CL'])).toBeNull()
    expect(instrumentFromQuery('', ['SPX', 'CL'])).toBeNull()
  })
})
