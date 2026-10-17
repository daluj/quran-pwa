import { useMemo } from 'react'
import type { Verse } from '../../data/types'
import { buildSearchIndex, parseQuery, searchVerses, type SearchIndexEntry, type SearchQuery } from '../../lib/search'
import type { Feed } from '../quran/feed'

// Normalizing 6,236 translations takes a few ms; do it once per feed.
let indexCache: { feed: Feed; index: SearchIndexEntry[] } | undefined

function indexFor(feed: Feed): SearchIndexEntry[] {
  if (indexCache?.feed !== feed) {
    const verses = feed.rows.flatMap((row) => (row.kind === 'verse' ? [row.verse] : []))
    indexCache = { feed, index: buildSearchIndex(verses) }
  }
  return indexCache.index
}

export interface SearchState {
  query: SearchQuery | null
  results: Verse[]
}

/** Parsed query and all matching verses (in Quran order) for `text`. */
export function useSearch(feed: Feed | undefined, text: string): SearchState {
  return useMemo(() => {
    const query = parseQuery(text)
    if (!feed || !query) return { query, results: [] }
    return { query, results: searchVerses(indexFor(feed), query) }
  }, [feed, text])
}
