import { useLiveQuery } from 'dexie-react-hooks'
import { db, type BookmarkType, type QuranDB } from './db'

export type BookmarkKeys = Partial<Record<BookmarkType, string>>

/** Current verse key of each bookmark type. */
export async function getBookmarks(database: QuranDB = db): Promise<BookmarkKeys> {
  const rows = await database.bookmarks.toArray()
  return Object.fromEntries(rows.map((b) => [b.type, b.verseKey]))
}

/**
 * Set the bookmark of `type` to `verseKey` (replacing any previous one), or
 * clear it when that verse is already the bookmark. Returns the new state.
 */
export async function toggleBookmark(
  type: BookmarkType,
  verseKey: string,
  database: QuranDB = db,
  now = Date.now(),
): Promise<boolean> {
  return database.transaction('rw', database.bookmarks, async () => {
    const current = await database.bookmarks.get(type)
    if (current?.verseKey === verseKey) {
      await database.bookmarks.delete(type)
      return false
    }
    await database.bookmarks.put({ type, verseKey, updatedAt: now })
    return true
  })
}

/** Live bookmark keys; empty while loading. */
export function useBookmarks(): BookmarkKeys {
  return useLiveQuery(() => getBookmarks(), [], {})
}
