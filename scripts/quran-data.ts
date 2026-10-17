// Pure parsing and validation for the Tanzil "Text (with aya numbers)" files.
// Kept free of file-system access so it can be unit tested.

import { createHash } from 'node:crypto'
import { normalizeArabic } from '../src/lib/arabic.ts'
import type { QuranMeta, Surah, Verse } from '../src/data/types.ts'

export const EXPECTED_VERSES = 6236
export const EXPECTED_SURAHS = 114

// The Bismillah is taken from verse 1:1 of the Arabic source, so it's always
// byte-identical to Tanzil's text.
const BISMILLAH_WORDS = 4

export class DataValidationError extends Error {
  constructor(source: string, problems: string[]) {
    super(`${source}: ${problems.length} problem(s)\n  - ${problems.slice(0, 20).join('\n  - ')}`)
    this.name = 'DataValidationError'
  }
}

export interface TanzilLine {
  surah: number
  ayah: number
  text: string
}

/**
 * Parse a Tanzil file: one `surah|ayah|text` per line, `#` lines (license
 * footer) and blank lines ignored. Throws if anything doesn't validate.
 */
export function parseTanzil(content: string, source: string): Map<string, TanzilLine> {
  const problems: string[] = []
  const verses = new Map<string, TanzilLine>()
  const lines = content.replace(/^﻿/, '').split(/\r?\n/)

  lines.forEach((line, i) => {
    const lineNo = i + 1
    if (line.startsWith('#') || line.trim() === '') return
    const match = /^(\d+)\|(\d+)\|(.*)$/.exec(line)
    if (!match) {
      problems.push(`line ${lineNo}: malformed (expected "surah|ayah|text")`)
      return
    }
    const surah = Number(match[1])
    const ayah = Number(match[2])
    const text = match[3]!.trim()
    const key = `${surah}:${ayah}`
    if (surah < 1 || surah > EXPECTED_SURAHS) problems.push(`line ${lineNo}: surah ${surah} out of range`)
    if (ayah < 1) problems.push(`line ${lineNo}: ayah ${ayah} out of range`)
    if (text === '') problems.push(`line ${lineNo}: empty text for ${key}`)
    if (verses.has(key)) problems.push(`line ${lineNo}: duplicate ${key}`)
    verses.set(key, { surah, ayah, text })
  })

  // Every surah must be present with ayahs numbered 1..n without gaps.
  const counts = new Map<number, number>()
  for (const v of verses.values()) counts.set(v.surah, (counts.get(v.surah) ?? 0) + 1)
  for (let s = 1; s <= EXPECTED_SURAHS; s++) {
    const n = counts.get(s) ?? 0
    if (n === 0) {
      problems.push(`surah ${s} missing`)
      continue
    }
    for (let a = 1; a <= n; a++) {
      if (!verses.has(`${s}:${a}`)) problems.push(`missing ${s}:${a}`)
    }
  }
  if (verses.size !== EXPECTED_VERSES) {
    problems.push(`expected ${EXPECTED_VERSES} verses, found ${verses.size}`)
  }

  if (problems.length > 0) throw new DataValidationError(source, problems)
  return verses
}

/** True when the surah header carries the Bismillah instead of verse 1. */
export function hasBismillahHeader(surah: number): boolean {
  return surah !== 1 && surah !== 9
}

/**
 * Tanzil prefixes the Bismillah to verse 1 of every surah except 1 and 9.
 * Remove it so the text matches the translation's verse boundaries. The
 * prefix is matched ignoring diacritics, because a few surahs (95, 97) spell
 * it with extra marks.
 */
export function stripBismillah(surah: number, ayah: number, text: string, bismillah: string): string {
  if (ayah !== 1 || !hasBismillahHeader(surah)) return text
  const words = text.split(' ')
  const prefix = words.slice(0, BISMILLAH_WORDS).join(' ')
  if (normalizeArabic(prefix) !== normalizeArabic(bismillah)) {
    throw new Error(`expected Bismillah prefix in ${surah}:1`)
  }
  const rest = words.slice(BISMILLAH_WORDS).join(' ').trim()
  if (rest === '') throw new Error(`${surah}:1 is empty after removing the Bismillah`)
  return rest
}

export interface QuranDataset {
  verses: Verse[]
  surahs: Surah[]
  meta: QuranMeta
}

/** Merge the parsed Arabic and translation into the bundled dataset. */
export function buildDataset(arabicContent: string, translationContent: string): QuranDataset {
  const arabic = parseTanzil(arabicContent, 'quran-uthmani.txt')
  const translation = parseTanzil(translationContent, 'en.translation.txt')

  const mismatched = [
    ...[...arabic.keys()].filter((k) => !translation.has(k)).map((k) => `${k} missing in translation`),
    ...[...translation.keys()].filter((k) => !arabic.has(k)).map((k) => `${k} missing in Arabic`),
  ]
  if (mismatched.length > 0) throw new DataValidationError('arabic vs translation', mismatched)

  const bismillah = arabic.get('1:1')!.text
  const verses: Verse[] = [...arabic.values()]
    .sort((a, b) => a.surah - b.surah || a.ayah - b.ayah)
    .map(({ surah, ayah, text }) => {
      const key = `${surah}:${ayah}`
      const textArabic = stripBismillah(surah, ayah, text, bismillah)
      return {
        surah,
        ayah,
        key,
        textArabic,
        textArabicPlain: normalizeArabic(textArabic),
        translation: translation.get(key)!.text,
      }
    })

  const surahs: Surah[] = []
  for (const v of verses) {
    if (v.ayah === 1) surahs.push({ number: v.surah, verseCount: 0, bismillah: hasBismillahHeader(v.surah) })
    surahs[surahs.length - 1]!.verseCount++
  }

  const version = createHash('sha256')
    .update(JSON.stringify({ verses, surahs }))
    .digest('hex')
    .slice(0, 12)

  return {
    verses,
    surahs,
    meta: { version, verseCount: verses.length, surahCount: surahs.length, bismillah },
  }
}

/** JSON array with one record per line, so diffs of the generated file stay readable. */
export function toJsonLines(records: unknown[]): string {
  return `[\n${records.map((r) => JSON.stringify(r)).join(',\n')}\n]\n`
}
