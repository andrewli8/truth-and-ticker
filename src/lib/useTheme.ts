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

function persist(theme: Theme): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* storage unavailable (private mode / SSR) — non-fatal */
    }
  }
}

/**
 * Theme state synced to `<html data-theme>`. Only an EXPLICIT choice is persisted, so a
 * derived OS default isn't frozen — a user who never toggles keeps following their OS across
 * visits, while a deliberate toggle sticks.
 */
export function useTheme(): { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(readInitial)

  useEffect(() => {
    apply(theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    persist(t)
    setThemeState(t)
  }, [])
  const toggle = useCallback(
    () =>
      setThemeState((t) => {
        const next = t === 'dark' ? 'light' : 'dark'
        persist(next)
        return next
      }),
    [],
  )

  return { theme, toggle, setTheme }
}
