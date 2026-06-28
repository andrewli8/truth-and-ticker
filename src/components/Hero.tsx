import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useReducedMotion } from '../lib/useReducedMotion'
import styles from './Hero.module.css'

// Fallback abstract market line if no real series path is supplied.
const FALLBACK_LINE =
  'M0,170 L100,150 L200,176 L300,140 L400,162 L470,150 L500,250 L560,232 L600,256 L660,206 L760,150 L860,120 L960,134 L1060,92 L1200,70'
const FALLBACK_AREA = `${FALLBACK_LINE} L1200,300 L0,300 Z`

interface Props {
  /** Real index line/area paths (viewBox 0 0 1200 300) for the backdrop. */
  linePath?: string
  areaPath?: string
}

export function Hero({ linePath, areaPath }: Props) {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      gsap.from('[data-hero]', {
        y: 34,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
      })
    },
    { dependencies: [reduced], scope: root },
  )

  return (
    <header className={styles.hero} ref={root}>
      <svg
        className={styles.backdrop}
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        data-testid="hero-backdrop"
      >
        <defs>
          <linearGradient id="heroLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--risk)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--risk)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* The real S&P 500 over the term (choppy start, April drop, recovery). */}
        <path className={styles.backdropArea} d={areaPath || FALLBACK_AREA} fill="url(#heroLineFill)" />
        <path className={styles.backdropLine} d={linePath || FALLBACK_LINE} fill="none" />
      </svg>
      <div className={styles.kicker} data-hero>JAN&nbsp;–&nbsp;JUN&nbsp;2025 · TRUMP’S SECOND&nbsp;TERM</div>
      <h1 className={styles.title} data-hero>
        TRUTH<span className={styles.amp}>&amp;</span>TICKER
      </h1>
      <p className={styles.thesis} data-hero>
        From day one, a presidency has played out in headlines and on Truth Social —
        tariffs, threats, strikes, ceasefires — and the markets moved on every word.
        Scroll to see thirty announcements laid against the S&amp;P 500, oil, defense,
        and gold. The timing is the story. Judge it yourself.
      </p>
      <div className={styles.scrollHint} data-hero aria-hidden="true">SCROLL ↓</div>
    </header>
  )
}
