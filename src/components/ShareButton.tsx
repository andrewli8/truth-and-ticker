import { useState, useCallback, useEffect } from 'react'
import styles from './ShareButton.module.css'

export const TWEET_TEXT =
  'When Trump posts, the market moves. Truth & Ticker maps 30 second-term announcements — tariffs, threats, strikes, ceasefires — against the S&P 500, oil, defense & gold 👇'

function shareUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

/** Share affordance: native share sheet when available, else copy-link + tweet intent. */
export function ShareButton() {
  const [copied, setCopied] = useState(false)

  // Reset the "copied" flag after 2s, cleaning the timer up on unmount/re-copy.
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const onShare = useCallback(async () => {
    const url = shareUrl()
    const nav = typeof navigator !== 'undefined' ? navigator : undefined
    if (nav && typeof nav.share === 'function') {
      try {
        await nav.share({ title: 'Truth & Ticker', text: TWEET_TEXT, url })
        return
      } catch {
        /* user dismissed — fall through to copy */
      }
    }
    if (nav?.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(url)
        setCopied(true)
      } catch {
        /* ignore */
      }
    }
  }, [])

  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    TWEET_TEXT,
  )}&url=${encodeURIComponent(shareUrl())}`

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.btn} onClick={onShare}>
        {copied ? 'Link copied ✓' : 'Share this'}
      </button>
      <a className={styles.tweet} href={tweetHref} target="_blank" rel="noreferrer">
        Post on X <span aria-hidden="true">↗</span>
        <span className="srOnly"> (opens in new tab)</span>
      </a>
    </div>
  )
}
