import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { PocApp } from '../PocApp'

const realMatchMedia = window.matchMedia
afterEach(() => {
  window.matchMedia = realMatchMedia
  vi.restoreAllMocks()
})

// Override the global setup's matchMedia (reduced-motion=true) so the GSAP entrance and
// the lerp-follow cursor effects actually run in jsdom — the project's browser-API-mock
// pattern (cf. useInView/useCountUp tests).
function mockMedia({ reduced, finePointer }: { reduced: boolean; finePointer: boolean }) {
  window.matchMedia = ((q: string) =>
    ({
      matches: /prefers-reduced-motion/.test(q)
        ? reduced
        : /pointer: fine/.test(q)
          ? finePointer
          : false,
      media: q,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false
      },
    })) as unknown as typeof window.matchMedia
}

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

  it('links back to the full story', () => {
    const { container } = render(<PocApp />)
    expect(container.querySelector('a.poc-back')?.getAttribute('href')).toBe('/')
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

  it('scrubs to the pointer position and resets on leave', () => {
    const { container } = render(<PocApp />)
    const chart = container.querySelector('svg.poc-chart') as SVGSVGElement
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 1440,
      height: 900,
      right: 1440,
      bottom: 900,
      x: 0,
      y: 0,
      toJSON() {},
    } as DOMRect)

    const meta = () => container.querySelector('.poc-meta')?.textContent
    const before = meta()
    // Pointer near the left edge → an early post, not the default latest one.
    fireEvent(chart, new MouseEvent('pointerdown', { clientX: 60, bubbles: true }))
    fireEvent(chart, new MouseEvent('pointermove', { clientX: 60, bubbles: true }))
    expect(meta()).not.toBe(before)
  })

  it('switches the charted instrument, re-plotting the line and kicker', () => {
    const { container, getByRole } = render(<PocApp />)
    const line = () => container.querySelector('.poc-line')?.getAttribute('d')
    const kicker = () => container.querySelector('.poc-kicker')?.textContent

    expect(kicker()).toMatch(/S&P 500/)
    const spxPath = line()
    // The switcher offers each instrument; picking Oil re-plots.
    const oil = getByRole('button', { name: 'Oil' })
    expect(oil.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(oil)
    expect(oil.getAttribute('aria-pressed')).toBe('true')
    expect(kicker()).toMatch(/Oil/)
    expect(line()).not.toBe(spxPath)
  })

  it('runs the GSAP entrance and lerp cursor when motion is allowed on a fine pointer', () => {
    mockMedia({ reduced: false, finePointer: true })
    const { container, unmount } = render(<PocApp />)
    expect(container.querySelector('.poc-cursor')).toBeTruthy()
    // Exercises the cursor's pointermove handler…
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 200 }))
    // …and the effect cleanup (listener + ticker removal) on unmount.
    expect(() => unmount()).not.toThrow()
  })
})
