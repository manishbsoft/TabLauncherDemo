import { BriefcaseBusiness, LoaderCircle } from 'lucide-react'
import { ApplicationCard } from './ApplicationCard.jsx'

export function ApplicationSidebar({ applications, isPending, error }) {
  return (
    <aside className="application-sidebar" aria-label="My applications">
      <header className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon"><BriefcaseBusiness size={17} strokeWidth={2.2} /></span>
          <span>WORKSPACE</span>
        </div>
        <div className="sidebar-title-row">
          <h2>My Applications</h2>
          <span className="app-count" aria-label={`${applications.length} applications`}>{applications.length}</span>
        </div>
        <p>Manage startup preferences and launch your applications.</p>
      </header>

      <div className="sidebar-list">
        {isPending && (
          <div className="sidebar-message"><LoaderCircle className="loading-icon" size={18} /> Loading applications…</div>
        )}
        {error && <div className="sidebar-message sidebar-error">Applications could not be loaded.</div>}
        {!isPending && !error && applications.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
        <p className="sidebar-footnote">Startup launches may be blocked by your browser. You can always launch apps manually.</p>
      </div>
    </aside>
  )
}
