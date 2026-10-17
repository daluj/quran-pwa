import { useLiveQuery } from 'dexie-react-hooks'
import type { Verse } from '../data/types'
import { db, type List, type ListItem, type ListType } from './db'
import { getListCounts, getListItems, getLists, getSavedVerseKeys, getVerseListIds, type SavedVerseKeys } from './lists'

const EMPTY_SAVED: SavedVerseKeys = { collection: new Set(), prayer: new Set() }

/** Lists of one type with their verse counts; undefined while loading. */
export function useLists(type: ListType): Array<List & { count: number }> | undefined {
  return useLiveQuery(async () => {
    const [lists, counts] = await Promise.all([getLists(type), getListCounts()])
    return lists.map((l) => ({ ...l, count: counts.get(l.id) ?? 0 }))
  }, [type])
}

/** One list; null if it doesn't exist, undefined while loading. */
export function useList(id: string | undefined): List | null | undefined {
  return useLiveQuery(async () => (id ? ((await db.lists.get(id)) ?? null) : null), [id])
}

export interface ListEntry {
  item: ListItem
  verse: Verse
}

/** A list's verses in order, joined with their text. */
export function useListEntries(listId: string | undefined): ListEntry[] | undefined {
  return useLiveQuery(async () => {
    if (!listId) return []
    const items = await getListItems(listId)
    const verses = await db.verses.bulkGet(items.map((i) => i.verseKey))
    return items.flatMap((item, i) => (verses[i] ? [{ item, verse: verses[i] }] : []))
  }, [listId])
}

/** Which lists of `type` contain the verse. */
export function useVerseListIds(type: ListType, verseKey: string): Set<string> | undefined {
  return useLiveQuery(() => getVerseListIds(type, verseKey), [type, verseKey])
}

/** Verse keys saved anywhere, for the filled save icons in the feed. */
export function useSavedVerseKeys(): SavedVerseKeys {
  return useLiveQuery(() => getSavedVerseKeys(), [], EMPTY_SAVED)
}
