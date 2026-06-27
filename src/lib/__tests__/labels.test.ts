import { describe, it, expect } from 'vitest'
import { typeLabel } from '../labels'
import type { AnnType } from '../types'

describe('typeLabel', () => {
  it('maps hyphenated enums to readable labels', () => {
    expect(typeLabel('market-jawbone')).toBe('Market jawbone')
    expect(typeLabel('trade-deal')).toBe('Trade deal')
  })
  it('covers every AnnType (no raw enum leaks)', () => {
    const all: AnnType[] = [
      'strike', 'threat', 'ceasefire', 'market-jawbone', 'tariff', 'trade-deal', 'fed', 'policy',
    ]
    for (const t of all) {
      expect(typeLabel(t)).not.toContain('-')
      expect(typeLabel(t)[0]).toBe(typeLabel(t)[0].toUpperCase())
    }
  })
})
