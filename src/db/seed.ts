import defaultLists from '../data/default-lists.json'
import type { DefaultList, QuranMeta, Surah, Verse } from '../data/types'
import type { List, ListItem, QuranDB } from './db'

export const DATA_VERSION_KEY = 'quranDataVersion'
export const DEFAULT_LISTS_KEY = 'defaultListsSeeded'
/** Recorded by installs from before the default collections existed. */
export const LEGACY_DEFAULT_TOPICS_KEY = 'defaultTopicsSeeded'

/** Prayer topics and collections, with their verses, created on first launch. */
export const DEFAULT_LISTS = defaultLists as DefaultList[]

export interface QuranSource {
  meta: QuranMeta
  surahs: Surah[]
  /** Loaded lazily: only fetched when the stored data is missing or outdated. */
  loadVerses: () => Promise<Verse[]>
}

export type SeedResult = 'seeded' | 'up-to-date'

/**
 * Load the bundled Quran data into IndexedDB if it's missing or its version
 * changed. User tables (lists, bookmarks, settings) are never touched.
 */
export async function seedQuranData(db: QuranDB, source: QuranSource): Promise<SeedResult> {
  const stored = await db.meta.get(DATA_VERSION_KEY)
  const count = await db.verses.count()
  if (stored?.value === source.meta.version && count === source.meta.verseCount) return 'up-to-date'

  const verses = await source.loadVerses()
  if (verses.length !== source.meta.verseCount) {
    throw new Error(`Quran data is incomplete: expected ${source.meta.verseCount} verses, got ${verses.length}`)
  }

  await db.transaction('rw', db.verses, db.surahs, db.meta, async () => {
    await db.verses.clear()
    await db.surahs.clear()
    await db.verses.bulkAdd(verses)
    await db.surahs.bulkAdd(source.surahs)
    await db.meta.put({ key: DATA_VERSION_KEY, value: source.meta.version })
  })
  return 'seeded'
}

/**
 * Create the default prayer topics and collections, with their verses, on
 * first launch. If the user later renames or deletes them, they aren't
 * recreated. Installs that already got the older six default topics are left
 * as they are, so nothing is duplicated.
 */
export async function seedDefaultLists(
  db: QuranDB,
  defaults: DefaultList[] = DEFAULT_LISTS,
  now = Date.now(),
): Promise<boolean> {
  return db.transaction('rw', db.lists, db.listItems, db.meta, async () => {
    if ((await db.meta.get(DEFAULT_LISTS_KEY)) || (await db.meta.get(LEGACY_DEFAULT_TOPICS_KEY))) return false
    const lists: List[] = []
    const items: ListItem[] = []
    defaults.forEach(({ type, name, verses }, i) => {
      // Distinct timestamps keep the defaults in this order when sorting by createdAt.
      const list: List = { id: crypto.randomUUID(), name, type, isDefault: true, createdAt: now + i, updatedAt: now + i }
      lists.push(list)
      verses.forEach((verseKey, position) =>
        items.push({ id: crypto.randomUUID(), listId: list.id, verseKey, position, addedAt: now + i }),
      )
    })
    await db.lists.bulkAdd(lists)
    await db.listItems.bulkAdd(items)
    await db.meta.put({ key: DEFAULT_LISTS_KEY, value: String(now) })
    return true
  })
}
