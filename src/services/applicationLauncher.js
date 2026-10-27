const windowReferences = new Map()

function validateUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url.href
  } catch {
    return null
  }
}

function windowNameFor(applicationId) {
  const safeId = String(applicationId).replace(/[^a-zA-Z0-9_-]/g, '-')
  return `workspace-application-${safeId}`
}

function getTrackedReference(applicationId) {
  const reference = windowReferences.get(applicationId)
  if (!reference) return null

  try {
    if (!reference.closed) return reference
  } catch (error) {
    console.warn(`Unable to inspect the tracked window for ${applicationId}.`, error)
  }

  windowReferences.delete(applicationId)
  return null
}

export const applicationLauncher = {
  launch(application) {
    const url = validateUrl(application.url)
    if (!url) {
      return { status: 'invalid-url', message: 'Invalid or unsupported application URL.' }
    }

    const existingReference = getTrackedReference(application.id)
    if (existingReference) {
      try {
        existingReference.focus()
        return { status: 'focused', message: 'Requested focus for the previously opened application window.' }
      } catch (error) {
        console.warn(`Unable to focus the tracked window for ${application.id}.`, error)
        return { status: 'focus-failed', message: 'An existing window was found, but the browser rejected the focus request.' }
      }
    }

    const target = windowNameFor(application.id)

    try {
      const reference = application.launchTarget === 'window'
        ? window.open(url, target, 'popup,width=1200,height=800')
        : window.open(url, target)
      if (!reference) {
        return { status: 'blocked', message: 'The browser blocked this popup. Try allowing popups or launch manually.' }
      }
      windowReferences.set(application.id, reference)
      try {
        reference.focus()
      } catch (error) {
        console.warn(`Unable to request focus for the named context for ${application.id}.`, error)
      }
      return {
        status: 'opened',
        message: `Browser requested the named ${application.launchTarget === 'window' ? 'window' : 'tab'} and a focus change; reuse and focus depend on browser policy.`,
      }
    } catch (error) {
      console.error(`Unable to open ${application.name}.`, error)
      return { status: 'error', message: 'The browser could not open this application.' }
    }
  },
}
