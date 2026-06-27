import { useRef, useState, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useReducedMotion } from '../lib/useReducedMotion'
import { stepScrollTarget } from '../lib/scroll'
import styles from './ScrollStage.module.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Props {
  /** Number of discrete narrative steps. */
  steps: number
  /** Optional labels (one per step) for the jump-nav dots. */
  markers?: string[]
  /** Render-prop receiving continuous progress (0–1) and the active step index. */
  children: (progress: number, step: number) => ReactNode
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

/**
 * Pins a viewport (CSS sticky) while the page scrolls through `steps` screens,
 * exposing a continuous scroll progress. Lenis + ScrollTrigger add smooth scrub;
 * with reduced motion we fall back to a plain scroll listener and no smoothing.
 */
export function ScrollStage({ steps, markers, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = containerRef.current
      if (!el) return

      if (reduced) {
        const onScroll = () => {
          const rect = el.getBoundingClientRect()
          const total = rect.height - window.innerHeight
          const p = total > 0 ? clamp01(-rect.top / total) : 0
          setProgress(p)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
      }

      const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
      lenis.on('scroll', ScrollTrigger.update)
      const raf = (time: number) => lenis.raf(time)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => setProgress(self.progress),
      })

      return () => {
        trigger.kill()
        gsap.ticker.remove(raf)
        lenis.destroy()
      }
    },
    { dependencies: [reduced, steps], scope: containerRef },
  )

  const step = Math.min(steps - 1, Math.floor(progress * steps))

  const jumpTo = (i: number) => {
    const el = containerRef.current
    if (!el) return
    const offsetTop = el.getBoundingClientRect().top + window.scrollY
    const target = stepScrollTarget(i, steps, offsetTop, el.offsetHeight, window.innerHeight)
    window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div ref={containerRef} className={styles.container} style={{ height: `${steps * 100}vh` }}>
      <div className={styles.sticky}>
        <div className={styles.progress} aria-hidden="true">
          <span className={styles.progressFill} style={{ transform: `scaleX(${progress})` }} />
        </div>
        {children(progress, step)}
        {markers && markers.length > 0 && (
          <nav className={styles.dots} aria-label="Jump to announcement">
            {markers.map((label, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
                aria-label={`Jump to: ${label}`}
                aria-current={i === step ? 'true' : undefined}
                onClick={() => jumpTo(i)}
              />
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
