import { useEffect, useRef } from 'react'
import { applicationLauncher } from '../services/applicationLauncher.js'
import { useApplicationStore } from '../store/applicationStore.js'

const STARTUP_GUARD_KEY = 'workspace-startup-launch-attempted'
const PAGE_LOAD_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export function useStartupLauncher(applications, configurationPending) {
  const attempted = useRef(false)
  const setLaunchStatus = useApplicationStore((state) => state.setLaunchStatus)
  const recordActivity = useApplicationStore((state) => state.recordActivity)
  const setNotice = useApplicationStore((state) => state.setNotice)

  useEffect(() => {
    if (configurationPending || attempted.current || applications.length === 0) return
    attempted.current = true

    try {
      if (window.sessionStorage.getItem(STARTUP_GUARD_KEY) === PAGE_LOAD_ID) return
      window.sessionStorage.setItem(STARTUP_GUARD_KEY, PAGE_LOAD_ID)
    } catch (error) {
      console.error('Unable to read or set the current page startup guard.', error)
      setNotice('Session storage is unavailable. Duplicate startup attempts are prevented within this app instance.')
    }

    applications
      .filter((application) => application.launchAtStartup)
      .forEach((application) => {
        const result = applicationLauncher.launch(application)
        setLaunchStatus(application.id, result.status)
        recordActivity({
          applicationId: application.id,
          applicationName: application.name,
          owner: application.owner,
          target: application.launchTarget,
          source: 'startup',
          status: result.status,
          message: result.message,
        })
      })
  }, [applications, configurationPending, recordActivity, setLaunchStatus, setNotice])
}
