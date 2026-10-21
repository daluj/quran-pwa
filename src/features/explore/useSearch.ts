import { useMemo } from 'react'
import type { TranslationLanguage, Verse } from '../../data/types'
import { buildSearchIndex, parseQuery, searchVerses, type SearchIndexEntry, type SearchQuery } from '../../lib/search'
import { useSettings } from '../../db/settings'
import type { Feed } from '../quran/feed'

// Normalizing 6,236 translations takes a few ms; do it once per feed.
let indexCache: { feed: Feed; language: TranslationLanguage; index: SearchIndexEntry[] } | undefined

function indexFor(feed: Feed, language: TranslationLanguage): SearchIndexEntry[] {
  if (indexCache?.feed !== feed || indexCache.language !== language) {
    const verses = feed.rows.flatMap((row) => (row.kind === 'verse' ? [row.verse] : []))
    indexCache = { feed, language, index: buildSearchIndex(verses, language) }
  }
  return indexCache.index
}

export interface SearchState {
  query: SearchQuery | null
  results: Verse[]
}

/** Parsed query and all matching verses (in Quran order) for `text`. */
export function useSearch(feed: Feed | undefined, text: string): SearchState {
  const { translationLanguage } = useSettings()
  return useMemo(() => {
    const query = parseQuery(text)
    if (!feed || !query) return { query, results: [] }
    return { query, results: searchVerses(indexFor(feed, translationLanguage), query) }
  }, [feed, text, translationLanguage])
}
