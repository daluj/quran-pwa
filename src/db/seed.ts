import type { QuranMeta, Surah, Verse } from '../data/types'
import type { List, QuranDB } from './db'

export const DATA_VERSION_KEY = 'quranDataVersion'
export const DEFAULT_TOPICS_KEY = 'defaultTopicsSeeded'

export const DEFAULT_PRAYER_TOPICS = ['Forgiveness', 'Guidance', 'Protection', 'Gratitude', 'Patience', 'Mercy']

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
 * Create the default prayer topics once. If the user later renames or deletes
 * them, they aren't recreated.
 */
export async function seedDefaultTopics(db: QuranDB, now = Date.now()): Promise<boolean> {
  return db.transaction('rw', db.lists, db.meta, async () => {
    if (await db.meta.get(DEFAULT_TOPICS_KEY)) return false
    const topics: List[] = DEFAULT_PRAYER_TOPICS.map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      type: 'prayer',
      isDefault: true,
      // Distinct timestamps keep the default order when sorting by createdAt.
      createdAt: now + i,
      updatedAt: now + i,
    }))
    await db.lists.bulkAdd(topics)
    await db.meta.put({ key: DEFAULT_TOPICS_KEY, value: String(now) })
    return true
  })
}
