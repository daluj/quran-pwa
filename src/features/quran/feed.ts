import type { Surah, Verse } from '../../data/types'

export type FeedRow = { kind: 'surah'; surah: Surah } | { kind: 'verse'; verse: Verse; surah: Surah }

export interface Feed {
  rows: FeedRow[]
  /** Row index of each verse, by key ("2:255"). */
  verseRow: Map<string, number>
  /** Row index of each surah header, by surah number. */
  headerRow: Map<number, number>
}

/** Flatten the Quran into one row per surah header followed by its verses. */
export function buildFeed(verses: Verse[], surahs: Surah[]): Feed {
  const bySurah = new Map(surahs.map((s) => [s.number, s]))
  const rows: FeedRow[] = []
  const verseRow = new Map<string, number>()
  const headerRow = new Map<number, number>()

  for (const verse of verses) {
    const surah = bySurah.get(verse.surah)
    if (!surah) throw new Error(`No metadata for surah ${verse.surah}`)
    if (verse.ayah === 1) {
      headerRow.set(surah.number, rows.length)
      rows.push({ kind: 'surah', surah })
    }
    verseRow.set(verse.key, rows.length)
    rows.push({ kind: 'verse', verse, surah })
  }
  return { rows, verseRow, headerRow }
}

/**
 * Row to scroll to for a verse. Verse 1 scrolls to the surah header so the
 * surah's title and Bismillah are visible.
 */
export function scrollRowFor(feed: Feed, key: string): number | undefined {
  const [surah, ayah] = key.split(':').map(Number)
  if (ayah === 1 && surah !== undefined) return feed.headerRow.get(surah)
  return feed.verseRow.get(key)
}

export type VerseTarget = { ok: true; key: string } | { ok: false; message: string }

const POSITIVE_INT = /^[1-9]\d*$/

/** Validate `/quran/:surah/:ayah` route params against the surah metadata. */
export function resolveVerseTarget(surahParam: string, ayahParam: string, surahs: Surah[]): VerseTarget {
  if (!POSITIVE_INT.test(surahParam) || !POSITIVE_INT.test(ayahParam)) {
    return { ok: false, message: `"${surahParam}:${ayahParam}" is not a verse reference.` }
  }
  const surahNumber = Number(surahParam)
  const ayah = Number(ayahParam)
  const surah = surahs.find((s) => s.number === surahNumber)
  if (!surah) return { ok: false, message: `There is no surah ${surahNumber}. Surahs go from 1 to ${surahs.length}.` }
  if (ayah > surah.verseCount) {
    return {
      ok: false,
      message: `Surah ${surah.number} has ${surah.verseCount} verses, so ${surahNumber}:${ayah} doesn't exist.`,
    }
  }
  return { ok: true, key: `${surahNumber}:${ayah}` }
}
