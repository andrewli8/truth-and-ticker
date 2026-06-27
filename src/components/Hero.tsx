import styles from './Hero.module.css'

export function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.kicker}>JUNE 2025 · THE 12-DAY WAR</div>
      <h1 className={styles.title}>
        TRUTH<span className={styles.amp}>&amp;</span>TICKER
      </h1>
      <p className={styles.thesis}>
        For twelve days, a war was fought in headlines and on Truth Social — and the
        markets moved on every word. Scroll to see each announcement laid against the
        S&amp;P 500, oil, and the defense stocks that rose and fell with it. The timing
        is the story. Judge it yourself.
      </p>
      <div className={styles.scrollHint}>SCROLL ↓</div>
    </header>
  )
}
