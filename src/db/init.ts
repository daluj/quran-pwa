import meta from '../data/meta.json'
import surahs from '../data/surahs.json'
import type { QuranMeta, Surah, Verse } from '../data/types'
import versesUrl from '../data/verses.json?url'
import { db } from './db'
import { seedDefaultLists, seedQuranData } from './seed'

/** Ask the browser not to evict our data under storage pressure. */
async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    // Not supported or denied; the app still works.
  }
}

async function loadVerses(): Promise<Verse[]> {
  const response = await fetch(versesUrl)
  if (!response.ok) throw new Error(`Could not load Quran data (${response.status})`)
  return (await response.json()) as Verse[]
}

let initPromise: Promise<void> | undefined

/** Seed IndexedDB on first launch (or after a data update). Safe to call repeatedly. */
export function initDatabase(): Promise<void> {
  initPromise ??= (async () => {
    void requestPersistentStorage()
    await seedQuranData(db, { meta: meta as QuranMeta, surahs: surahs as Surah[], loadVerses })
    await seedDefaultLists(db)
  })()
  // Allow a retry after a failure.
  initPromise.catch(() => {
    initPromise = undefined
  })
  return initPromise
}
