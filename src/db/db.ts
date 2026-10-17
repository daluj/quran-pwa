import Dexie, { type EntityTable } from 'dexie'
import type { Surah, Verse } from '../data/types'

export type ListType = 'prayer' | 'collection'

export interface List {
  id: string
  name: string
  type: ListType
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export interface ListItem {
  id: string
  listId: string
  verseKey: string
  position: number
  addedAt: number
}

export type BookmarkType = 'lastRead' | 'lastRecited'

export interface Bookmark {
  type: BookmarkType
  verseKey: string
  updatedAt: number
}

export type ThemePreference = 'system' | 'light' | 'dark'

export interface Settings {
  theme: ThemePreference
  showTranslation: boolean
  /** Arabic font size in px */
  arabicFontSize: number
}

export type SettingKey = keyof Settings

export interface SettingRow<K extends SettingKey = SettingKey> {
  key: K
  value: Settings[K]
}

/** Internal bookkeeping (data version, one-time seeds); not part of exports. */
export interface MetaRow {
  key: string
  value: string
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  showTranslation: true,
  arabicFontSize: 28,
}

export class QuranDB extends Dexie {
  verses!: EntityTable<Verse, 'key'>
  surahs!: EntityTable<Surah, 'number'>
  lists!: EntityTable<List, 'id'>
  listItems!: EntityTable<ListItem, 'id'>
  bookmarks!: EntityTable<Bookmark, 'type'>
  settings!: EntityTable<SettingRow, 'key'>
  meta!: EntityTable<MetaRow, 'key'>

  constructor(name = 'quran-pwa') {
    super(name)
    this.version(1).stores({
      verses: '&key, surah, [surah+ayah]',
      surahs: '&number',
      lists: '&id, type, name',
      listItems: '&id, listId, verseKey, [listId+position], [listId+verseKey]',
      bookmarks: '&type',
      settings: '&key',
      meta: '&key',
    })
  }
}

export const db = new QuranDB()
