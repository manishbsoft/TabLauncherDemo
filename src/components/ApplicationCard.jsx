import { useState } from 'react'
import { ArrowUpRight, CircleCheck, ExternalLink, Pencil, X } from 'lucide-react'
import { applicationLauncher } from '../services/applicationLauncher.js'
import { useApplicationStore } from '../store/applicationStore.js'
import { LaunchTargetSelector } from './LaunchTargetSelector.jsx'
import { StartupToggle } from './StartupToggle.jsx'

const avatarColors = {
  'john-smith': 'avatar-blue',
  'priya-sharma': 'avatar-rose',
  'alex-morgan': 'avatar-violet',
  'sarah-wilson': 'avatar-amber',
}

export function ApplicationCard({ application }) {
  const setPreference = useApplicationStore((state) => state.setPreference)
  const setLaunchStatus = useApplicationStore((state) => state.setLaunchStatus)
  const recordActivity = useApplicationStore((state) => state.recordActivity)
  const [imageFailed, setImageFailed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlDraft, setUrlDraft] = useState(application.url)
  const [urlError, setUrlError] = useState('')
  const status = useApplicationStore((state) => state.launchStatuses[application.id])

  function handleLaunch() {
    const result = applicationLauncher.launch(application)
    setLaunchStatus(application.id, result.status)
    recordActivity({
      applicationId: application.id,
      applicationName: application.name,
      owner: application.owner,
      target: application.launchTarget,
      source: 'manual',
      status: result.status,
      message: result.message,
    })
  }

  function openUrlEditor() {
    setUrlDraft(application.url)
    setUrlError('')
    setEditingUrl(true)
  }

  function handleUrlSave(event) {
    event.preventDefault()
    let parsedUrl

    try {
      parsedUrl = new URL(urlDraft.trim())
    } catch {
      setUrlError('Enter a complete URL, such as https://example.com.')
      return
    }

    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      setUrlError('Only HTTP and HTTPS URLs are supported.')
      return
    }

    setPreference(application.id, { url: parsedUrl.href })
    setEditingUrl(false)
    setUrlError('')
  }

  return (
    <article className="application-card">
      <div className="card-topline">
        <div className="application-identity">
          <div className={`avatar ${avatarColors[application.id] || ''}`}>
            {application.avatar && !imageFailed && imageLoaded ? (
              <img src={application.avatar} alt="" />
            ) : (
              <span>{application.initials}</span>
            )}
            {application.avatar && !imageFailed && !imageLoaded && (
              <img
                className="avatar-image-loading"
                src={application.avatar}
                alt=""
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageFailed(true)}
              />
            )}
          </div>
          <div className="application-title">
            <h3>{application.name}</h3>
            <p>{application.owner}</p>
          </div>
        </div>
        <div className="card-actions">
          <button
            className="edit-button"
            type="button"
            title="Edit application URL"
            aria-label={`Edit ${application.name} URL`}
            onClick={openUrlEditor}
          >
            <Pencil size={15} />
          </button>
          <button
            className="launch-button"
            type="button"
            title="Launch application"
            aria-label={`Launch ${application.name}`}
            onClick={handleLaunch}
          >
            <ExternalLink size={17} />
          </button>
        </div>
      </div>
      {editingUrl && (
        <div className="url-editor-backdrop">
          <form
            className="url-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-url-title-${application.id}`}
            onSubmit={handleUrlSave}
          >
            <div className="url-editor-heading">
              <div>
                <span className="section-kicker">APPLICATION SETTINGS</span>
                <h3 id={`edit-url-title-${application.id}`}>Edit application URL</h3>
              </div>
              <button
                type="button"
                className="url-editor-close"
                aria-label="Cancel editing URL"
                onClick={() => setEditingUrl(false)}
              >
                <X size={17} />
              </button>
            </div>
            <label htmlFor={`application-url-${application.id}`}>Application URL</label>
            <input
              id={`application-url-${application.id}`}
              type="url"
              value={urlDraft}
              onChange={(event) => {
                setUrlDraft(event.target.value)
                setUrlError('')
              }}
              placeholder="https://example.com"
              required
              autoFocus
            />
            {urlError && <p className="url-editor-error" role="alert">{urlError}</p>}
            <div className="url-editor-actions">
              <button type="button" className="button button-quiet" onClick={() => setEditingUrl(false)}>
                Cancel
              </button>
              <button type="submit" className="button button-primary">Save URL</button>
            </div>
          </form>
        </div>
      )}
      <p className="application-description">{application.description}</p>
      <div className="app-category"><span /> {application.category}</div>
      <div className="card-divider" />
      <StartupToggle
        enabled={Boolean(application.launchAtStartup)}
        onChange={(launchAtStartup) => setPreference(application.id, { launchAtStartup })}
      />
      <div className="launch-target-label">OPEN APPLICATION IN</div>
      <LaunchTargetSelector
        applicationId={application.id}
        value={application.launchTarget || 'tab'}
        onChange={(launchTarget) => setPreference(application.id, { launchTarget })}
      />
      {status && (
        <div className={`card-status status-${status}`}>
          {status === 'opened' || status === 'focused'
            ? <CircleCheck size={12} />
            : <ArrowUpRight size={12} />}
          <span>{status === 'opened' ? 'Launch requested' : status === 'focused' ? 'Focus requested' : status.replace('-', ' ')}</span>
        </div>
      )}
    </article>
  )
}
