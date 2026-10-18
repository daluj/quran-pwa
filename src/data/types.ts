// Shapes of the generated files in src/data/ (written by scripts/build-quran-data.ts).

export interface Verse {
  surah: number
  ayah: number
  /** "surah:ayah", e.g. "2:255" */
  key: string
  textArabic: string
  /** Arabic without diacritics, normalized for search */
  textArabicPlain: string
  translation: string
}

export interface Surah {
  number: number
  verseCount: number
  /** Whether the surah header shows the Bismillah (all except 1 and 9). */
  bismillah: boolean
}

/** A prayer topic or collection created on first launch (src/data/default-lists.json). */
export interface DefaultList {
  type: 'prayer' | 'collection'
  name: string
  /** Verse keys in list order. */
  verses: string[]
}

export interface QuranMeta {
  /** Content hash of the generated data; changes trigger a re-seed. */
  version: string
  verseCount: number
  surahCount: number
  bismillah: string
}
