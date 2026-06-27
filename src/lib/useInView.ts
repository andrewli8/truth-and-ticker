import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * True once the referenced element scrolls into view. Falls back to `true` when
 * IntersectionObserver is unavailable (SSR/jsdom), so content is never hidden.
 */
export function useInView<T extends Element>(
  options?: IntersectionObserverInit,
): { ref: RefObject<T>; inView: boolean } {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState<boolean>(
    typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      }
    }, options ?? { rootMargin: '0px 0px -15% 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [options])

  return { ref, inView }
}
