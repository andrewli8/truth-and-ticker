import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useReducedMotion } from '../lib/useReducedMotion'
import styles from './Hero.module.css'

export function Hero() {
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
      <div className={styles.kicker} data-hero>JUNE 2025 · THE 12-DAY WAR</div>
      <h1 className={styles.title} data-hero>
        TRUTH<span className={styles.amp}>&amp;</span>TICKER
      </h1>
      <p className={styles.thesis} data-hero>
        For twelve days, a war was fought in headlines and on Truth Social — and the
        markets moved on every word. Scroll to see each announcement laid against the
        S&amp;P 500, oil, and the defense stocks that rose and fell with it. The timing
        is the story. Judge it yourself.
      </p>
      <div className={styles.scrollHint} data-hero>SCROLL ↓</div>
    </header>
  )
}
