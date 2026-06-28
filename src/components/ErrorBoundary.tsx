import { Component, type ErrorInfo, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Top-level safety net: if any descendant throws during render, show a graceful,
 * on-brand fallback (with a reload affordance) instead of a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface for diagnostics rather than swallowing it silently.
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback} role="alert">
          <h1 className={styles.title}>Something went wrong.</h1>
          <p className={styles.body}>
            The page hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            type="button"
            className={styles.btn}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
