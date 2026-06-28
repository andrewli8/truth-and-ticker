import { describe, it, expect, afterEach } from 'vitest'
import { createElement } from 'react'
import { render, renderHook, act } from '@testing-library/react'
import { useInView } from '../useInView'

describe('useInView', () => {
  it('defaults to true when IntersectionObserver is unavailable (jsdom)', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>())
    expect(result.current.inView).toBe(true)
    expect(result.current.ref).toBeDefined()
  })

  describe('with IntersectionObserver present', () => {
    const orig = (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver
    afterEach(() => {
      ;(globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = orig
    })

    let lastOptions: IntersectionObserverInit | undefined
    function installMockIO() {
      const callbacks: IntersectionObserverCallback[] = []
      let disconnects = 0
      class MockIO {
        constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          callbacks.push(cb)
          lastOptions = options
        }
        observe() {}
        unobserve() {}
        disconnect() {
          disconnects += 1
        }
        takeRecords() {
          return []
        }
      }
      ;(globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
        MockIO as unknown as typeof IntersectionObserver
      return {
        fireIntersecting: () =>
          act(() => {
            callbacks.forEach((cb) =>
              cb(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver,
              ),
            )
          }),
        disconnects: () => disconnects,
      }
    }

    function Probe() {
      const { ref, inView } = useInView<HTMLDivElement>()
      return createElement('div', { ref, 'data-testid': 'probe' }, inView ? 'in' : 'out')
    }

    it('starts hidden, then flips to inView when the element intersects', () => {
      const io = installMockIO()
      const { getByTestId } = render(createElement(Probe))
      // Observer is present → initial state is "out", not the jsdom fallback.
      expect(getByTestId('probe').textContent).toBe('out')

      io.fireIntersecting()
      expect(getByTestId('probe').textContent).toBe('in')
      // It self-disconnects after first intersection (plus effect-cleanup teardown).
      expect(io.disconnects()).toBeGreaterThanOrEqual(1)
    })

    it('passes caller-supplied options through to the observer', () => {
      installMockIO()
      function OptProbe() {
        const { ref } = useInView<HTMLDivElement>({ rootMargin: '0px 0px -50% 0px', threshold: 0.5 })
        return createElement('div', { ref })
      }
      render(createElement(OptProbe))
      expect(lastOptions).toEqual({ rootMargin: '0px 0px -50% 0px', threshold: 0.5 })
    })
  })
})
