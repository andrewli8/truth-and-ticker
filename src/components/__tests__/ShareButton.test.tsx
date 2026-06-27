import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ShareButton, TWEET_TEXT } from '../ShareButton'

describe('ShareButton', () => {
  it('renders a share control and a tweet intent link', () => {
    const { getByRole } = render(<ShareButton />)
    expect(getByRole('button').textContent).toMatch(/share/i)
    const link = getByRole('link') as HTMLAnchorElement
    expect(link.href).toContain('twitter.com/intent/tweet')
    expect(link.href).toContain('text=')
  })

  it('pitches the whole second term, not just the June war', () => {
    expect(TWEET_TEXT).toMatch(/second-term/i)
    expect(TWEET_TEXT).not.toMatch(/12-day|israel–iran war|june 2025/i)
  })
})
