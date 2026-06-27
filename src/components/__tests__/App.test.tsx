import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from '../../App'

describe('App', () => {
  it('renders the hero thesis and the outro ledger without throwing', () => {
    const { getByText, getAllByTestId } = render(<App />)
    expect(getByText(/The timing is the story/i)).toBeInTheDocument()
    expect(getAllByTestId('summary-row').length).toBeGreaterThanOrEqual(6)
  })
})
