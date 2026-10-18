import { createContext, useContext } from 'react'
import { db, DEFAULT_SETTINGS, type QuranDB, type SettingKey, type Settings } from './db'

export async function getSettings(database: QuranDB = db): Promise<Settings> {
  const rows = await database.settings.toArray()
  const settings = { ...DEFAULT_SETTINGS }
  for (const row of rows) Object.assign(settings, { [row.key]: row.value })
  return settings
}

export async function setSetting<K extends SettingKey>(
  key: K,
  value: Settings[K],
  database: QuranDB = db,
): Promise<void> {
  await database.settings.put({ key, value })
}

export interface TextVisibility {
  arabic: boolean
  english: boolean
}

/** Which texts a verse shows. English-only always shows the translation. */
export function textVisibility({ showTranslation, englishOnly }: Settings): TextVisibility {
  return { arabic: !englishOnly, english: englishOnly || showTranslation }
}

/** Live settings, provided by SettingsProvider (loaded before the app renders). */
export const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS)

export function useSettings(): Settings {
  return useContext(SettingsContext)
}

export function useTextVisibility(): TextVisibility {
  return textVisibility(useSettings())
}
