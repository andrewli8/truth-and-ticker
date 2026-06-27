import { useState, useCallback } from 'react'
import styles from './ShareButton.module.css'

const TWEET_TEXT =
  'When Trump posted, the market moved. Truth & Ticker maps his June 2025 Israel–Iran war announcements against the S&P 500, oil & defense stocks 👇'

function shareUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

/** Share affordance: native share sheet when available, else copy-link + tweet intent. */
export function ShareButton() {
  const [copied, setCopied] = useState(false)

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
        setTimeout(() => setCopied(false), 2000)
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
        Post on X ↗
      </a>
    </div>
  )
}
