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
