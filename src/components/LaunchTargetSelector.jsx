import { AppWindow, PanelsTopLeft } from 'lucide-react'

export function LaunchTargetSelector({ applicationId, value, onChange }) {
  return (
    <div className="launch-target-options" role="radiogroup" aria-label="Launch target">
      <label className={value === 'tab' ? 'target-option selected' : 'target-option'}>
        <input
          type="radio"
          name={`launch-target-${applicationId}`}
          value="tab"
          checked={value === 'tab'}
          onChange={() => onChange('tab')}
        />
        <PanelsTopLeft size={13} />
        <span>New tab</span>
      </label>
      <label className={value === 'window' ? 'target-option selected' : 'target-option'}>
        <input
          type="radio"
          name={`launch-target-${applicationId}`}
          value="window"
          checked={value === 'window'}
          onChange={() => onChange('window')}
        />
        <AppWindow size={13} />
        <span>New window</span>
      </label>
    </div>
  )
}
