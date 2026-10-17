// Text normalization used at build time (to produce `textArabicPlain`) and at
// runtime (search queries and match highlighting). Normalization works one
// character at a time and keeps a map back to the original text, so a match
// in the normalized text can be highlighted in the original.

// Harakat, tanween, shadda, sukun, superscript alef, Quranic annotation signs
// (small high letters, pause marks, rub el hizb, sajda), and tatweel.
const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g
const DIACRITIC = /^[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]$/
const ALIF_FORMS = /^[\u0622\u0623\u0625\u0671\u0672\u0673]$/
const WHITESPACE = /^\s$/

/** Remove diacritics and Quranic marks, keeping the base letters. */
export function stripDiacritics(text: string): string {
  return text.replace(DIACRITICS, '')
}

/**
 * Arabic search form of one character: diacritics dropped, alif forms
 * (أ إ آ ٱ ٲ ٳ) → ا, ta marbuta (ة) → ه, alif maqsura (ى) → ي.
 */
function arabicChar(c: string): string {
  if (DIACRITIC.test(c)) return ''
  if (ALIF_FORMS.test(c)) return '\u0627'
  if (c === '\u0629') return '\u0647'
  if (c === '\u0649') return '\u064A'
  return c
}

/** Latin search form of one character: lowercase, accents dropped (é → e). */
function latinChar(c: string): string {
  return c.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export interface NormalizedText {
  text: string
  /** `map[i]` is the index in the original text of normalized character `i`. */
  map: number[]
}

function normalizeWithMap(text: string, normalizeChar: (c: string) => string): NormalizedText {
  let out = ''
  const map: number[] = []
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    if (WHITESPACE.test(c)) {
      // Collapse runs of whitespace (including those left by removed marks).
      if (out.length > 0 && !out.endsWith(' ')) {
        out += ' '
        map.push(i)
      }
      continue
    }
    for (const n of normalizeChar(c)) {
      out += n
      map.push(i)
    }
  }
  return { text: out, map }
}

export function normalizeArabicWithMap(text: string): NormalizedText {
  return normalizeWithMap(text, arabicChar)
}

export function normalizeLatinWithMap(text: string): NormalizedText {
  return normalizeWithMap(text, latinChar)
}

/** Arabic normalized for search (see `arabicChar`), whitespace collapsed. */
export function normalizeArabic(text: string): string {
  return normalizeArabicWithMap(text).text.trim()
}

/** Translation text normalized for search: lowercase, no accents. */
export function normalizeLatin(text: string): string {
  return normalizeLatinWithMap(text).text.trim()
}

const ARABIC_LETTER = /[\u0621-\u064A\u0671-\u06D3]/

export function containsArabic(text: string): boolean {
  return ARABIC_LETTER.test(text)
}
