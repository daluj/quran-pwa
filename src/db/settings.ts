import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS, type SettingKey, type Settings } from './db'

export async function getSettings(): Promise<Settings> {
  const rows = await db.settings.toArray()
  const settings = { ...DEFAULT_SETTINGS }
  for (const row of rows) Object.assign(settings, { [row.key]: row.value })
  return settings
}

export async function setSetting<K extends SettingKey>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value })
}

/** Live settings, falling back to defaults while loading. */
export function useSettings(): Settings {
  return useLiveQuery(getSettings, [], DEFAULT_SETTINGS)
}
