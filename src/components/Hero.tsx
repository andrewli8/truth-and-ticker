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
      <div className={styles.kicker} data-hero>JAN – JUN 2025 · TRUMP&apos;S SECOND TERM</div>
      <h1 className={styles.title} data-hero>
        TRUTH<span className={styles.amp}>&amp;</span>TICKER
      </h1>
      <p className={styles.thesis} data-hero>
        From day one, a presidency has played out in headlines and on Truth Social —
        tariffs, threats, strikes, ceasefires — and the markets moved on every word.
        Scroll to see thirty announcements laid against the S&amp;P 500, oil, defense,
        and the dollar. The timing is the story. Judge it yourself.
      </p>
      <div className={styles.scrollHint} data-hero>SCROLL ↓</div>
    </header>
  )
}
