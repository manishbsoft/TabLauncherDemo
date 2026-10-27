import { create } from 'zustand'

const PREFERENCES_KEY = 'workspace-application-preferences'
let preferencesLoadFailed = false

function loadPreferences() {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY)
    const parsed = stored ? JSON.parse(stored) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, preference]) => preference && typeof preference === 'object')
        .map(([applicationId, preference]) => [applicationId, {
          ...(typeof preference.url === 'string' ? { url: preference.url } : {}),
          ...(typeof preference.launchAtStartup === 'boolean'
            ? { launchAtStartup: preference.launchAtStartup }
            : {}),
          ...(preference.launchTarget === 'tab' || preference.launchTarget === 'window'
            ? { launchTarget: preference.launchTarget }
            : {}),
        }]),
    )
  } catch (error) {
    console.error('Unable to load application preferences from local storage.', error)
    preferencesLoadFailed = true
    return {}
  }
}

function persistPreferences(preferences) {
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error('Unable to save application preferences to local storage.', error)
    throw error
  }
}

export const useApplicationStore = create((set, get) => ({
  preferences: loadPreferences(),
  activity: [],
  launchStatuses: {},
  notice: preferencesLoadFailed
    ? 'Browser local storage is unavailable. Preferences may not persist across visits.'
    : '',

  setPreference(applicationId, preference) {
    const preferences = {
      ...get().preferences,
      [applicationId]: {
        ...get().preferences[applicationId],
        ...preference,
      },
    }
    set({ preferences })
    try {
      persistPreferences(preferences)
    } catch {
      set({ notice: 'Your preference changed for this session, but the browser could not save it for future visits.' })
    }
  },

  resetPreferences() {
    try {
      window.localStorage.removeItem(PREFERENCES_KEY)
      set({ preferences: {}, notice: '' })
    } catch (error) {
      console.error('Unable to reset application preferences.', error)
      set({ notice: 'The browser did not allow preferences to be reset.' })
    }
  },

  recordActivity(entry) {
    const activityItem = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({ activity: [activityItem, ...state.activity].slice(0, 30) }))
  },

  setLaunchStatus(applicationId, status) {
    set((state) => ({ launchStatuses: { ...state.launchStatuses, [applicationId]: status } }))
  },

  clearActivity() {
    set({ activity: [] })
  },

  setNotice(notice) {
    set({ notice })
  },
}))
