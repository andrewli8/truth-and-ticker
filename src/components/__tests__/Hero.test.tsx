import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Hero } from '../Hero'

describe('Hero', () => {
  it('renders the rescoped kicker and thesis (whole second term)', () => {
    const { getByText } = render(<Hero />)
    expect(getByText(/SECOND TERM/i)).toBeInTheDocument()
    expect(getByText(/The timing is the story/i)).toBeInTheDocument()
    // No residual 12-day-war framing.
    expect(getByText(/From day one/i)).toBeInTheDocument()
  })

  it('renders a decorative, aria-hidden market-line backdrop', () => {
    const { getByTestId } = render(<Hero />)
    const backdrop = getByTestId('hero-backdrop')
    expect(backdrop).toBeInTheDocument()
    expect(backdrop.getAttribute('aria-hidden')).toBe('true')
    // It carries the abstract line path, not just an empty frame.
    expect(backdrop.querySelector('path')?.getAttribute('d')).toBeTruthy()
  })

  it('mounts without error under reduced motion (GSAP entrance skipped)', () => {
    // The test environment reports prefers-reduced-motion: reduce, so the GSAP
    // timeline is skipped; the hero must still render its content.
    const { getByRole } = render(<Hero />)
    expect(getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
