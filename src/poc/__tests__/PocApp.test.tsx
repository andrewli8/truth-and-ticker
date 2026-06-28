import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PocApp } from '../PocApp'

describe('PocApp (one-screen POC)', () => {
  it('renders the headline, a reaction readout, and the chart', () => {
    const { container, getByText } = render(<PocApp />)
    expect(getByText(/When he posts/i)).toBeInTheDocument()
    // The default (latest) post's reaction shows as a signed percentage.
    expect(container.querySelector('.poc-pct')?.textContent).toMatch(/[+\-−]\d|n\/a/)
    // The interactive chart (line + a marker per announcement) renders.
    expect(container.querySelector('svg.poc-chart path.poc-line')).toBeTruthy()
    expect(container.querySelectorAll('circle.poc-dot').length).toBeGreaterThan(10)
  })

  it('colours the scene by the active reaction direction', () => {
    const { container } = render(<PocApp />)
    const dir = container.querySelector('.poc')?.getAttribute('data-dir')
    expect(['up', 'down', 'flat']).toContain(dir)
  })
})
