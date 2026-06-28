import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ScrollStage } from '../ScrollStage'

describe('ScrollStage', () => {
  it('renders one nav dot per marker and the render-prop children', () => {
    const markers = ['alpha', 'bravo', 'charlie']
    const { getByText, getAllByRole } = render(
      <ScrollStage steps={3} markers={markers}>
        {(_progress, step) => <div>step {step} of 3</div>}
      </ScrollStage>,
    )
    // The render-prop child is shown, starting at step 0.
    expect(getByText(/step 0 of 3/)).toBeInTheDocument()
    // One jump-nav dot per marker, each labelled.
    const dots = getAllByRole('button')
    expect(dots).toHaveLength(markers.length)
    expect(dots[0].getAttribute('aria-label')).toContain('alpha')
    expect(dots[0].getAttribute('aria-current')).toBe('true') // step 0 active
  })

  it('omits the nav when there are no markers', () => {
    const { queryAllByRole, getByText } = render(
      <ScrollStage steps={2}>{(_p, step) => <div>panel {step}</div>}</ScrollStage>,
    )
    expect(getByText(/panel 0/)).toBeInTheDocument()
    expect(queryAllByRole('button')).toHaveLength(0)
  })

  it('renders every step as a stacked panel (no dot-nav) on mobile', () => {
    const orig = window.matchMedia
    // Report a mobile width so ScrollStage takes its stacked, non-pinned path.
    window.matchMedia = ((query: string) =>
      ({
        matches: /max-width/.test(query),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList)
    try {
      const { getAllByText, queryAllByRole } = render(
        <ScrollStage steps={3} markers={['a', 'b', 'c']}>
          {(_p, step) => <div>panel {step}</div>}
        </ScrollStage>,
      )
      expect(getAllByText(/panel/)).toHaveLength(3) // all panels rendered
      expect(queryAllByRole('button')).toHaveLength(0) // no pinned jump-nav on mobile
    } finally {
      window.matchMedia = orig
    }
  })
})
