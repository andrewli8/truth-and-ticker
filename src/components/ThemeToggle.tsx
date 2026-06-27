import { useTheme } from '../lib/useTheme'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className={styles.icon} aria-hidden="true">{isDark ? '☀' : '☾'}</span>
      <span className={styles.label}>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
