import { AppLayout } from './components/AppLayout.jsx'
import { ApplicationSidebar } from './components/ApplicationSidebar.jsx'
import { BrowserCapabilities } from './components/BrowserCapabilities.jsx'
import { LaunchActivity } from './components/LaunchActivity.jsx'
import { useApplications } from './hooks/useApplications.js'
import { useStartupLauncher } from './hooks/useStartupLauncher.js'
import { useApplicationStore } from './store/applicationStore.js'
import './App.css'

function App() {
  const { data: configuredApplications = [], isPending, error } = useApplications()
  const preferences = useApplicationStore((state) => state.preferences)
  const resetPreferences = useApplicationStore((state) => state.resetPreferences)
  const clearActivity = useApplicationStore((state) => state.clearActivity)
  const notice = useApplicationStore((state) => state.notice)
  const setNotice = useApplicationStore((state) => state.setNotice)

  const applications = configuredApplications.map((application) => ({
    ...application,
    ...preferences[application.id],
  }))

  useStartupLauncher(applications, isPending || Boolean(error))

  function handleResetGuard() {
    try {
      window.sessionStorage.removeItem('workspace-startup-launch-attempted')
      setNotice('Startup guard reset. Eligible apps will be considered after the next page load.')
    } catch (storageError) {
      console.error('Unable to reset the startup guard.', storageError)
      setNotice('The browser did not allow access to session storage, so the startup guard could not be reset.')
    }
  }

  function handleResetPreferences() {
    if (window.confirm('Restore all application URLs, startup preferences, and launch targets to their defaults?')) {
      resetPreferences()
      setNotice('Application preferences have been restored to their defaults.')
    }
  }

  return (
    <AppLayout
      sidebar={
        <ApplicationSidebar applications={applications} isPending={isPending} error={error} />
      }
    >
      <header className="workspace-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> WORKSPACE OVERVIEW</div>
          <h1>Application Workspace</h1>
          <p>Everything you need, ready when you are.</p>
        </div>
        <div className="workspace-user" aria-label="Signed in as Jordan Lee">
          <span className="user-avatar">JL</span>
          <span className="user-name">Jordan Lee</span>
        </div>
      </header>

      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="welcome-kicker">YOUR WORK, IN ONE PLACE</span>
          <h2>Good morning, Jordan <span aria-hidden="true">✦</span></h2>
          <p>Launch your configured applications from the sidebar. Choose what opens at startup and where each app lives.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-window"><span /><span /><span /><div className="art-window-content"><i /><i /><i /></div></div>
          <div className="art-sparkle sparkle-one">✦</div>
          <div className="art-sparkle sparkle-two">✧</div>
        </div>
      </section>

      {notice && (
        <div className="notice-banner" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button>
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          Application configuration could not be loaded: {error.message}
        </div>
      )}

      <div className="section-heading">
        <div>
          <span className="section-kicker">YOUR WORKSPACE</span>
          <h2>Workspace tools</h2>
        </div>
        <span className="live-indicator"><span /> ALL SYSTEMS READY</span>
      </div>

      <BrowserCapabilities />
      <LaunchActivity />

      <section className="demo-controls" aria-labelledby="demo-controls-title">
        <div>
          <span className="section-kicker">TRY IT OUT</span>
          <h2 id="demo-controls-title">Demo controls</h2>
          <p>Explore how startup preferences and browser sessions work.</p>
        </div>
        <div className="control-actions">
          <button type="button" className="button button-secondary" onClick={() => window.location.reload()}>
            Simulate Workspace Refresh
          </button>
          <button type="button" className="button button-secondary" onClick={handleResetGuard}>
            Reset Session Guard
          </button>
          <button type="button" className="button button-quiet" onClick={handleResetPreferences}>
            Reset Preferences
          </button>
          <button type="button" className="button button-quiet" onClick={clearActivity}>
            Clear Activity
          </button>
        </div>
      </section>
    </AppLayout>
  )
}

export default App
