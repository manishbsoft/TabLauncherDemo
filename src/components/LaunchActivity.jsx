import { ArrowDownRight, ArrowUpRight, CircleCheck, Clock3, ExternalLink, ShieldAlert } from 'lucide-react'
import { useApplicationStore } from '../store/applicationStore.js'

function activityIcon(status) {
  if (status === 'opened') return <ArrowUpRight size={15} />
  if (status === 'focused') return <CircleCheck size={15} />
  if (status === 'blocked') return <ShieldAlert size={15} />
  if (status === 'invalid-url' || status === 'error' || status === 'focus-failed') return <ShieldAlert size={15} />
  return <ArrowDownRight size={15} />
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp))
}

export function LaunchActivity() {
  const activity = useApplicationStore((state) => state.activity)

  return (
    <section className="activity-section" aria-labelledby="activity-title">
      <div className="activity-header">
        <div>
          <span className="section-kicker">LATEST EVENTS</span>
          <h2 id="activity-title">Launch activity</h2>
        </div>
        <span className="activity-count">{activity.length}</span>
      </div>
      {activity.length === 0 ? (
        <div className="activity-empty">
          <Clock3 size={15} />
          <span>Launch attempts will appear here.</span>
        </div>
      ) : (
        <div className="activity-list" aria-live="polite">
          {activity.slice(0, 8).map((item) => (
            <div className="activity-item" key={item.id}>
              <span className={`activity-icon ${item.status}`}>{activityIcon(item.status)}</span>
              <div>
                <strong>{item.applicationName} <span>· {item.owner}</span></strong>
                <p><ExternalLink size={10} /> {item.message}</p>
              </div>
              <time className="activity-time" dateTime={item.timestamp}>{formatTime(item.timestamp)}</time>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
