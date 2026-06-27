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
})
