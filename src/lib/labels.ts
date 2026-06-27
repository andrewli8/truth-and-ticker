import type { AnnType } from './types'

// Single source of human-readable event-type labels. Rendered in neutral case;
// callers that want all-caps apply text-transform in CSS.
const LABELS: Record<AnnType, string> = {
  strike: 'Military strike',
  threat: 'Threat / signal',
  ceasefire: 'Ceasefire',
  'market-jawbone': 'Market jawbone',
  tariff: 'Tariff',
  'trade-deal': 'Trade deal',
  fed: 'Fed pressure',
  policy: 'Policy',
}

/** Human label for an announcement type; falls back to the raw value if unknown. */
export function typeLabel(type: AnnType): string {
  return LABELS[type] ?? type
}

export type AccentGroup = 'risk' | 'warn' | 'relief'

// Which legend bucket each type falls in — mirrors the theme accent colours.
const GROUP: Record<AnnType, AccentGroup> = {
  strike: 'risk',
  tariff: 'risk',
  threat: 'warn',
  'market-jawbone': 'warn',
  fed: 'warn',
  policy: 'warn',
  ceasefire: 'relief',
  'trade-deal': 'relief',
}

/** Legend category (risk-off / pressure / relief) for an announcement type. */
export function accentGroup(type: AnnType): AccentGroup {
  return GROUP[type] ?? 'warn'
}
