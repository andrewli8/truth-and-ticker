import { formatPct, direction } from '../lib/format'
import styles from './ChartReactionLabel.module.css'

interface Props {
  /** Close-to-close reaction; the label is omitted entirely when null. */
  pct: number | null
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
  /** test id so each chart can address its own label. */
  testid: string
}

/**
 * The market reaction stated as SVG text on a chart, coloured by direction with a
 * background halo (paint-order stroke) so it stays legible over the line and fill.
 * Shared by the deep-dive playhead callout and the overview's selected-marker label.
 */
export function ChartReactionLabel({ pct, x, y, anchor, testid }: Props) {
  if (pct === null) return null
  return (
    <text
      data-testid={testid}
      data-dir={direction(pct)}
      // Decorative: the value is exposed via the chart's accessible name (chartAriaLabel)
      // and the zoom detail panel's text, so hide this visual echo from screen readers.
      aria-hidden="true"
      className={styles.label}
      x={x}
      y={y}
      textAnchor={anchor}
    >
      {formatPct(pct)}
    </text>
  )
}
