import type { Verse } from '../data/types'
import {
  containsArabic,
  normalizeArabic,
  normalizeArabicWithMap,
  normalizeLatin,
  normalizeLatinWithMap,
  type NormalizedText,
} from './arabic'

export type Script = 'arabic' | 'latin'

export interface SearchQuery {
  /** Arabic queries search the Arabic text; anything else the translation. */
  script: Script
  /** Normalized words; a verse matches when it contains all of them. */
  terms: string[]
}

export const MIN_QUERY_LENGTH = 2

/** Normalize a typed query; null if it's too short to search. */
export function parseQuery(input: string): SearchQuery | null {
  const script: Script = containsArabic(input) ? 'arabic' : 'latin'
  const normalized = script === 'arabic' ? normalizeArabic(input) : normalizeLatin(input)
  const terms = [...new Set(normalized.split(' ').filter(Boolean))]
  if (terms.join('').length < MIN_QUERY_LENGTH) return null
  return { script, terms }
}

export interface SearchIndexEntry {
  verse: Verse
  /** Normalized translation (the Arabic side uses `verse.textArabicPlain`). */
  latin: string
}

export function buildSearchIndex(verses: Verse[]): SearchIndexEntry[] {
  return verses.map((verse) => ({ verse, latin: normalizeLatin(verse.translation) }))
}

/** All matching verses, in Quran order. */
export function searchVerses(index: SearchIndexEntry[], query: SearchQuery): Verse[] {
  const results: Verse[] = []
  for (const entry of index) {
    const haystack = query.script === 'arabic' ? entry.verse.textArabicPlain : entry.latin
    if (query.terms.every((term) => haystack.includes(term))) results.push(entry.verse)
  }
  return results
}

export type Range = [start: number, end: number]

/**
 * Where the query's terms appear in `text` (the original, unnormalized text),
 * as merged [start, end) ranges. Arabic matches widen to whole words: marking
 * part of a word would split its joined letters and diacritics.
 */
export function highlightRanges(text: string, query: SearchQuery): Range[] {
  const normalized: NormalizedText =
    query.script === 'arabic' ? normalizeArabicWithMap(text) : normalizeLatinWithMap(text)
  const ranges: Range[] = []

  for (const term of query.terms) {
    let from = 0
    for (;;) {
      const at = normalized.text.indexOf(term, from)
      if (at < 0) break
      let start = normalized.map[at]!
      let end = normalized.map[at + term.length - 1]! + 1
      if (query.script === 'arabic') {
        while (start > 0 && !/\s/.test(text[start - 1]!)) start--
        while (end < text.length && !/\s/.test(text[end]!)) end++
      } else {
        // Keep combining accents attached to the last matched letter.
        while (end < text.length && /\p{M}/u.test(text[end]!)) end++
      }
      ranges.push([start, end])
      from = at + 1
    }
  }

  // Merge overlapping ranges, and neighbours separated only by spaces, so a
  // matched phrase reads as one highlight.
  ranges.sort((a, b) => a[0] - b[0])
  const merged: Range[] = []
  for (const range of ranges) {
    const last = merged[merged.length - 1]
    if (last && (range[0] <= last[1] || text.slice(last[1], range[0]).trim() === '')) {
      last[1] = Math.max(last[1], range[1])
    } else {
      merged.push([...range])
    }
  }
  return merged
}
