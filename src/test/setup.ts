import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia; GSAP/ScrollTrigger and useReducedMotion both need it.
// Report reduced-motion=true under test so ScrollStage uses its lightweight,
// no-Lenis code path (jsdom has no real layout/animation engine anyway).
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) =>
    ({
      matches: /prefers-reduced-motion/.test(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// jsdom has no ResizeObserver (used by Lenis); provide a no-op stub.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}
