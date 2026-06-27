import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'theme'

/** Light by default; only an explicit stored 'dark' opts into dark mode. */
function readInitial(): Theme {
  if (typeof localStorage === 'undefined') return 'light'
  return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
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
