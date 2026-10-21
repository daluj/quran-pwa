import type { TranslationLanguage, Verse } from '../data/types'
import {
  ALIF,
  containsArabic,
  normalizeArabicSearchWithMap,
  normalizeLatin,
  normalizeLatinWithMap,
  OPTIONAL_LETTER,
} from './arabic'

export type Script = 'arabic' | 'latin'

export interface SearchQuery {
  /** Arabic queries search the Arabic text; anything else the translation. */
  script: Script
  /** Normalized words; a verse matches when it contains all of them. */
  terms: string[]
  /** For Arabic: one pattern per term, tolerant of Uthmani spelling. */
  patterns: RegExp[]
}

export const MIN_QUERY_LENGTH = 2

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Pattern for one Arabic search term. Uthmani spelling often writes a long
 * vowel as a dagger alif, or a hamza on its own, where everyday spelling uses
 * a full alif or a hamza seat (e.g. "al-'alamin" or "yas'alunaka").
 * Those marks are normalized to OPTIONAL_LETTER: a typed alif also matches
 * one, and one may appear between any two typed letters. A typed alif still
 * has to match something, so "qala" (said) doesn't match "qul" (say).
 */
function arabicTermPattern(term: string): RegExp {
  const optional = `${OPTIONAL_LETTER}*`
  const letters = [...term].filter((c) => c !== OPTIONAL_LETTER)
  const body = letters
    .map((c) => (c === ALIF ? `[${ALIF}${OPTIONAL_LETTER}]` : escapeRegExp(c)))
    .join(optional)
  return new RegExp(body)
}

/** Normalize a typed query; null if it's too short to search. */
export function parseQuery(input: string): SearchQuery | null {
  const script: Script = containsArabic(input) ? 'arabic' : 'latin'
  const normalized = script === 'arabic' ? normalizeArabicSearchWithMap(input).text.trim() : normalizeLatin(input)
  const terms = [...new Set(normalized.split(' ').filter(Boolean))]
  const letters = terms.join('').replaceAll(OPTIONAL_LETTER, '')
  if (letters.length < MIN_QUERY_LENGTH) return null
  return { script, terms, patterns: script === 'arabic' ? terms.map(arabicTermPattern) : [] }
}

export interface SearchIndexEntry {
  verse: Verse
  /** Arabic search skeleton (see `normalizeArabicSearchWithMap`). */
  arabic: string
  /** Normalized translation. */
  latin: string
}

export function buildSearchIndex(verses: Verse[], language: TranslationLanguage): SearchIndexEntry[] {
  return verses.map((verse) => ({
    verse,
    arabic: normalizeArabicSearchWithMap(verse.textArabic).text,
    latin: normalizeLatin(verse.translations[language]),
  }))
}

/** All matching verses, in Quran order. */
export function searchVerses(index: SearchIndexEntry[], query: SearchQuery): Verse[] {
  const matches =
    query.script === 'arabic'
      ? (e: SearchIndexEntry) => query.patterns.every((p) => p.test(e.arabic))
      : (e: SearchIndexEntry) => query.terms.every((t) => e.latin.includes(t))
  return index.filter(matches).map((e) => e.verse)
}

export type Range = [start: number, end: number]

/** [start, end) of every match of the query in normalized text. */
function normalizedMatches(normalized: string, query: SearchQuery): Range[] {
  const found: Range[] = []
  if (query.script === 'arabic') {
    for (const pattern of query.patterns) {
      for (const m of normalized.matchAll(new RegExp(pattern.source, 'g'))) {
        found.push([m.index, m.index + m[0].length])
      }
    }
  } else {
    for (const term of query.terms) {
      for (let at = normalized.indexOf(term); at >= 0; at = normalized.indexOf(term, at + 1)) {
        found.push([at, at + term.length])
      }
    }
  }
  return found
}

/**
 * Where the query's terms appear in `text` (the original, unnormalized text),
 * as merged [start, end) ranges. Arabic matches widen to whole words: marking
 * part of a word would split its joined letters and diacritics.
 */
export function highlightRanges(text: string, query: SearchQuery): Range[] {
  const arabic = query.script === 'arabic'
  const normalized = arabic ? normalizeArabicSearchWithMap(text) : normalizeLatinWithMap(text)

  const ranges: Range[] = normalizedMatches(normalized.text, query).map(([from, to]) => {
    let start = normalized.map[from]!
    let end = normalized.map[to - 1]! + 1
    if (arabic) {
      while (start > 0 && !/\s/.test(text[start - 1]!)) start--
      while (end < text.length && !/\s/.test(text[end]!)) end++
    } else {
      // Keep combining accents attached to the last matched letter.
      while (end < text.length && /\p{M}/u.test(text[end]!)) end++
    }
    return [start, end]
  })

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
