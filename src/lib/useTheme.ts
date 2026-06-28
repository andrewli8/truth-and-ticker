import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'theme'

/**
 * An explicit stored choice wins; with none, fall back to the OS `prefers-color-scheme`
 * (so dark-mode users land in dark on first visit). Light is the final default.
 */
function readInitial(): Theme {
  if (typeof localStorage === 'undefined') return 'light'
  const stored = localStorage.getItem(KEY)
  if (stored === 'dark' || stored === 'light') return stored
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function apply(theme: Theme): void {
  if (typeof document === 'undefined') return
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
}

/** Theme state synced to <html data-theme> and localStorage. */
export function useTheme(): { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(readInitial)

  useEffect(() => {
    apply(theme)
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const toggle = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggle, setTheme }
}
