import { Power } from 'lucide-react'

export function StartupToggle({ enabled, onChange }) {
  return (
    <div className="startup-row">
      <div className="startup-label">
        <Power size={13} />
        <span>Launch at startup</span>
      </div>
      <button
        type="button"
        className={`toggle-switch ${enabled ? 'is-on' : ''}`}
        role="switch"
        aria-checked={enabled}
        aria-label="Launch at startup"
        onClick={() => onChange(!enabled)}
      >
        <span />
      </button>
    </div>
  )
}
