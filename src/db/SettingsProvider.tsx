import { useLiveQuery } from 'dexie-react-hooks'
import type { ReactNode } from 'react'
import { getSettings, SettingsContext } from './settings'

/**
 * Loads the settings once for the whole app and keeps them live. Children
 * render only once they're known, so nothing first draws with the defaults
 * (e.g. the translation appearing, then disappearing).
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useLiveQuery(() => getSettings(), [])
  if (!settings) return null
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}
