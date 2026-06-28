import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
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

  it('scrubs the timeline with the keyboard (focusable slider + arrow stepping)', () => {
    const { container } = render(<PocApp />)
    const chart = container.querySelector('svg.poc-chart') as SVGSVGElement
    // Keyboard-accessible: focusable with a slider role.
    expect(chart.getAttribute('tabindex')).toBe('0')
    expect(chart.getAttribute('role')).toBe('slider')

    const meta = () => container.querySelector('.poc-meta')?.textContent
    const before = meta()
    // Default is the latest post; ArrowLeft steps to an earlier one.
    fireEvent.keyDown(chart, { key: 'ArrowLeft' })
    const stepped = meta()
    expect(stepped).not.toBe(before)
    // ArrowRight steps back toward the latest.
    fireEvent.keyDown(chart, { key: 'ArrowRight' })
    expect(meta()).toBe(before)
  })

  it('advertises keyboard scrubbing in the on-screen hint', () => {
    const { container } = render(<PocApp />)
    expect(container.querySelector('.poc-hint')?.textContent).toMatch(/arrow/i)
  })

  it('jumps to the first and last announcement with Home/End', () => {
    const { container } = render(<PocApp />)
    const chart = container.querySelector('svg.poc-chart') as SVGSVGElement
    const meta = () => container.querySelector('.poc-meta')?.textContent

    // Default is the latest post (rightmost). End keeps us there; Home jumps to the first.
    const last = meta()
    fireEvent.keyDown(chart, { key: 'Home' })
    const first = meta()
    expect(first).not.toBe(last)
    fireEvent.keyDown(chart, { key: 'End' })
    expect(meta()).toBe(last)
    // From the first post, End must reach the same latest post.
    fireEvent.keyDown(chart, { key: 'Home' })
    expect(meta()).toBe(first)
    fireEvent.keyDown(chart, { key: 'End' })
    expect(meta()).toBe(last)
  })
})
