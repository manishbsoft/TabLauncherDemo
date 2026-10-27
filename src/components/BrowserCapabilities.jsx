import { AppWindow, Focus, ShieldCheck } from 'lucide-react'

export function BrowserCapabilities() {
  return (
    <section className="capability-grid" aria-label="Browser capabilities">
      <article className="capability-card">
        <span className="capability-icon"><ShieldCheck size={16} /></span>
        <h3>Popup permissions</h3>
        <p>Browsers may block startup popups without a user gesture. Allow popups or use the manual launch control.</p>
      </article>
      <article className="capability-card">
        <span className="capability-icon amber"><Focus size={16} /></span>
        <h3>Focus is browser-controlled</h3>
        <p>We request focus for tracked windows, but browser settings and user-gesture rules decide what actually happens.</p>
      </article>
      <article className="capability-card">
        <span className="capability-icon teal"><AppWindow size={16} /></span>
        <h3>Reuse has limits</h3>
        <p>Only windows opened by this page can be tracked. References are lost on refresh and other tabs cannot be found reliably.</p>
      </article>
    </section>
  )
}
