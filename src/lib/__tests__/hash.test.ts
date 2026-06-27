import { describe, it, expect } from 'vitest'
import { eventIdFromHash, hashForEvent } from '../hash'

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
})
