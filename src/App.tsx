import { HubApp } from './hub/HubApp'
import './styles/app.css'

/**
 * Truth & Ticker is now a single-screen interactive hub: the whole second term on one
 * viewport, a horizontal filmstrip you scroll/drag, and click-to-zoom detail layers.
 * (The earlier long-form scrollytelling version lives in git history; the standalone
 * "When he posts" concept is at /poc.html.)
 */
export default function App() {
  return <HubApp />
}
