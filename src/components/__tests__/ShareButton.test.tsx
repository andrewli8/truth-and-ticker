import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { ShareButton, TWEET_TEXT } from '../ShareButton'

describe('ShareButton', () => {
  it('renders a share control and a tweet intent link', () => {
    const { getByRole } = render(<ShareButton />)
    expect(getByRole('button').textContent).toMatch(/share/i)
    const link = getByRole('link') as HTMLAnchorElement
    expect(link.href).toContain('twitter.com/intent/tweet')
    expect(link.href).toContain('text=')
  })

  it('warns assistive tech that the tweet link opens in a new tab', () => {
    const { getByRole } = render(<ShareButton />)
    // The visual ↗ is aria-hidden; the accessible name carries the context switch.
    expect(getByRole('link', { name: /opens in new tab/i })).toBeTruthy()
  })

  describe('onShare', () => {
    afterEach(() => {
      vi.restoreAllMocks()
      // remove any stubbed share/clipboard so tests don't leak into each other
      Reflect.deleteProperty(navigator as object, 'share')
      Reflect.deleteProperty(navigator as object, 'clipboard')
    })

    it('uses the native share sheet (text + URL) when available', async () => {
      const share = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'share', { value: share, configurable: true })
      const { getByRole } = render(<ShareButton />)
      fireEvent.click(getByRole('button', { name: /share/i }))
      await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
      expect(share.mock.calls[0][0]).toMatchObject({ text: TWEET_TEXT })
      expect(share.mock.calls[0][0].url).toBeDefined()
    })

    it('falls back to clipboard + "Link copied" when native share is absent', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
      const { getByRole } = render(<ShareButton />)
      fireEvent.click(getByRole('button', { name: /share/i }))
      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(getByRole('button').textContent).toMatch(/copied/i))
    })
  })

  it('pitches the whole second term, not just the June war', () => {
    expect(TWEET_TEXT).toMatch(/second-term/i)
    expect(TWEET_TEXT).not.toMatch(/12-day|israel–iran war|june 2025/i)
  })
})
