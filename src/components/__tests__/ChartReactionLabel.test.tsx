import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChartReactionLabel } from '../ChartReactionLabel'

// Render the SVG-only component inside an <svg> host so jsdom keeps it in the SVG namespace.
function renderInSvg(node: React.ReactNode) {
  return render(<svg>{node}</svg>)
}

describe('ChartReactionLabel', () => {
  it('renders the formatted percentage with an up direction for gains', () => {
    const { getByTestId } = renderInSvg(
      <ChartReactionLabel pct={0.88} x={10} y={10} anchor="start" testid="r" />,
    )
    const el = getByTestId('r')
    expect(el.textContent).toBe('+0.88%')
    expect(el.getAttribute('data-dir')).toBe('up')
  })

  it('marks losses as a down move', () => {
    const { getByTestId } = renderInSvg(
      <ChartReactionLabel pct={-1.2} x={10} y={10} anchor="end" testid="r" />,
    )
    const el = getByTestId('r')
    expect(el.textContent).toBe('-1.20%')
    expect(el.getAttribute('data-dir')).toBe('down')
  })

  it('renders nothing when pct is null', () => {
    const { queryByTestId } = renderInSvg(
      <ChartReactionLabel pct={null} x={10} y={10} anchor="middle" testid="r" />,
    )
    expect(queryByTestId('r')).toBeNull()
  })

  it('applies the requested text anchor and position', () => {
    const { getByTestId } = renderInSvg(
      <ChartReactionLabel pct={2} x={42} y={7} anchor="middle" testid="r" />,
    )
    const el = getByTestId('r')
    expect(el.getAttribute('text-anchor')).toBe('middle')
    expect(el.getAttribute('x')).toBe('42')
    expect(el.getAttribute('y')).toBe('7')
  })
})
