import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

function Boom(): JSX.Element {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders its children when nothing throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    )
    expect(getByText('all good')).toBeInTheDocument()
  })

  it('renders a fallback with a reload affordance when a child throws', () => {
    // React logs the caught error; silence it to keep test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getByText, getByRole } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(getByText(/something went wrong/i)).toBeInTheDocument()
    expect(getByRole('button', { name: /reload/i })).toBeInTheDocument()
  })
})
