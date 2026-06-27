import { useRef, useState, useEffect, type ReactNode } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'
import { stepScrollTarget } from '../lib/scroll'
import styles from './ScrollStage.module.css'

/** Scroll distance allotted to each narrative step (in vh). One viewport per event. */
const STEP_VH = 100

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
 * exposing a continuous scroll progress derived from native scroll position.
 * Progress updates are throttled to one per animation frame — no smooth-scroll
 * library, so scrolling stays native and responsive.
 */
export function ScrollStage({ steps, markers, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let raf = 0
    const compute = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      setProgress(total > 0 ? clamp01(-rect.top / total) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [steps])

  const step = Math.min(steps - 1, Math.floor(progress * steps))

  const jumpTo = (i: number) => {
    const el = containerRef.current
    if (!el) return
    const offsetTop = el.getBoundingClientRect().top + window.scrollY
    const target = stepScrollTarget(i, steps, offsetTop, el.offsetHeight, window.innerHeight)
    window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div ref={containerRef} className={styles.container} style={{ height: `${steps * STEP_VH}vh` }}>
      {/* Zero-size snap anchors at each step boundary — proximity-snap targets. */}
      {Array.from({ length: steps }).map((_, i) => (
        <div
          key={`snap-${i}`}
          className={styles.snapPoint}
          style={{ top: `${i * STEP_VH}vh` }}
          aria-hidden="true"
        />
      ))}
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
