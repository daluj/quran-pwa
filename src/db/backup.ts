import {
  ARABIC_FONT_SIZE,
  db,
  DEFAULT_SETTINGS,
  type Bookmark,
  type List,
  type ListItem,
  type QuranDB,
  type Settings,
} from './db'
import { getSettings } from './settings'

// Backup file: everything the user created (lists, their verses, bookmarks,
// settings). The Quran text isn't included; it ships with the app.

export const BACKUP_APP = 'quran-pwa'
export const BACKUP_FORMAT = 1

export interface Backup {
  app: typeof BACKUP_APP
  format: typeof BACKUP_FORMAT
  exportedAt: string
  lists: List[]
  listItems: ListItem[]
  bookmarks: Bookmark[]
  settings: Settings
}

export class BackupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupError'
  }
}

export async function createBackup(database: QuranDB = db, now = new Date()): Promise<Backup> {
  return database.transaction('r', [database.lists, database.listItems, database.bookmarks, database.settings], async () => ({
    app: BACKUP_APP,
    format: BACKUP_FORMAT,
    exportedAt: now.toISOString(),
    lists: await database.lists.toArray(),
    listItems: await database.listItems.toArray(),
    bookmarks: await database.bookmarks.toArray(),
    settings: await getSettings(database),
  }))
}

export function backupFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `quran-pwa-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`
}

// --- validation -------------------------------------------------------------

type Json = Record<string, unknown>

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0
const VERSE_KEY = /^[1-9]\d{0,2}:[1-9]\d{0,2}$/

function arrayOf<T>(value: unknown, name: string, check: (item: unknown, i: number) => T): T[] {
  if (!Array.isArray(value)) throw new BackupError(`“${name}” is missing or isn't a list.`)
  return value.map(check)
}

/**
 * Check a parsed backup file thoroughly before anything is written.
 * `verseExists` rejects verse keys that aren't in the Quran data.
 */
export function validateBackup(raw: unknown, verseExists: (key: string) => boolean): Backup {
  if (!isObject(raw) || raw.app !== BACKUP_APP) {
    throw new BackupError("This file isn't a Quran app backup.")
  }
  if (raw.format !== BACKUP_FORMAT) {
    throw new BackupError(`This backup uses format ${String(raw.format)}, which this version can't read.`)
  }

  const lists = arrayOf(raw.lists, 'lists', (l, i): List => {
    if (
      !isObject(l) ||
      !isString(l.id) ||
      !isString(l.name) ||
      (l.type !== 'prayer' && l.type !== 'collection') ||
      typeof l.isDefault !== 'boolean' ||
      !isTime(l.createdAt) ||
      !isTime(l.updatedAt)
    ) {
      throw new BackupError(`List ${i + 1} is invalid.`)
    }
    return { id: l.id, name: l.name, type: l.type, isDefault: l.isDefault, createdAt: l.createdAt, updatedAt: l.updatedAt }
  })
  const listIds = new Set(lists.map((l) => l.id))
  if (listIds.size !== lists.length) throw new BackupError('Two lists share the same id.')

  const seen = new Set<string>()
  const listItems = arrayOf(raw.listItems, 'listItems', (it, i): ListItem => {
    if (
      !isObject(it) ||
      !isString(it.id) ||
      !isString(it.listId) ||
      !isString(it.verseKey) ||
      typeof it.position !== 'number' ||
      !Number.isFinite(it.position) ||
      !isTime(it.addedAt)
    ) {
      throw new BackupError(`Saved verse ${i + 1} is invalid.`)
    }
    if (!listIds.has(it.listId)) throw new BackupError(`Saved verse ${i + 1} belongs to a list that isn't in the file.`)
    if (!VERSE_KEY.test(it.verseKey) || !verseExists(it.verseKey)) {
      throw new BackupError(`Saved verse ${i + 1} refers to ${it.verseKey}, which isn't a verse.`)
    }
    const pair = `${it.listId} ${it.verseKey}`
    if (seen.has(pair)) throw new BackupError(`Verse ${it.verseKey} appears twice in the same list.`)
    seen.add(pair)
    return { id: it.id, listId: it.listId, verseKey: it.verseKey, position: it.position, addedAt: it.addedAt }
  })

  const bookmarks = arrayOf(raw.bookmarks, 'bookmarks', (b, i): Bookmark => {
    if (
      !isObject(b) ||
      (b.type !== 'lastRead' && b.type !== 'lastRecited') ||
      !isString(b.verseKey) ||
      !verseExists(b.verseKey) ||
      !isTime(b.updatedAt)
    ) {
      throw new BackupError(`Bookmark ${i + 1} is invalid.`)
    }
    return { type: b.type, verseKey: b.verseKey, updatedAt: b.updatedAt }
  })
  if (new Set(bookmarks.map((b) => b.type)).size !== bookmarks.length) {
    throw new BackupError('The file has two bookmarks of the same kind.')
  }

  const s = raw.settings
  if (!isObject(s)) throw new BackupError('“settings” is missing.')
  const settings: Settings = { ...DEFAULT_SETTINGS }
  if (s.theme === 'system' || s.theme === 'light' || s.theme === 'dark') settings.theme = s.theme
  if (typeof s.showTranslation === 'boolean') settings.showTranslation = s.showTranslation
  if (typeof s.englishOnly === 'boolean') settings.englishOnly = s.englishOnly
  if (
    typeof s.arabicFontSize === 'number' &&
    s.arabicFontSize >= ARABIC_FONT_SIZE.min &&
    s.arabicFontSize <= ARABIC_FONT_SIZE.max
  ) {
    settings.arabicFontSize = s.arabicFontSize
  }

  return {
    app: BACKUP_APP,
    format: BACKUP_FORMAT,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : '',
    lists,
    listItems,
    bookmarks,
    settings,
  }
}

/** Read and validate a backup file's text. */
export async function parseBackupFile(text: string, database: QuranDB = db): Promise<Backup> {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new BackupError("This file isn't valid JSON.")
  }
  const keys = new Set(await database.verses.toCollection().primaryKeys())
  return validateBackup(raw, (key) => keys.has(key))
}

/**
 * Replace all user data with the backup's, in one transaction: either all of
 * it is restored or nothing changes. The Quran text is untouched.
 */
export async function restoreBackup(backup: Backup, database: QuranDB = db): Promise<void> {
  await database.transaction(
    'rw',
    [database.lists, database.listItems, database.bookmarks, database.settings],
    async () => {
      await Promise.all([
        database.lists.clear(),
        database.listItems.clear(),
        database.bookmarks.clear(),
        database.settings.clear(),
      ])
      await database.lists.bulkAdd(backup.lists)
      await database.listItems.bulkAdd(backup.listItems)
      await database.bookmarks.bulkAdd(backup.bookmarks)
      await database.settings.bulkAdd(
        (Object.keys(backup.settings) as (keyof Settings)[]).map((key) => ({ key, value: backup.settings[key] })),
      )
    },
  )
}

export interface BackupSummary {
  prayer: number
  collection: number
  verses: number
  bookmarks: number
}

export function summarizeBackup(backup: Backup): BackupSummary {
  return {
    prayer: backup.lists.filter((l) => l.type === 'prayer').length,
    collection: backup.lists.filter((l) => l.type === 'collection').length,
    verses: backup.listItems.length,
    bookmarks: backup.bookmarks.length,
  }
}
