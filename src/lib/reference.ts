import type { Surah } from '../data/types'
import { resolveVerseTarget } from '../features/quran/feed'

export type ReferenceResult =
  /** Not a reference: treat the input as a text search. */
  | { kind: 'none' }
  | { kind: 'ok'; surah: number; ayah: number | undefined; label: string; path: string }
  | { kind: 'error'; message: string }

// "25", "25:43", "25 43", "25.43", "25/43", "25-43"; Arabic-Indic digits allowed.
const REFERENCE = /^(\d+)(?:\s*[:./-]\s*|\s+)?(\d+)?$/

const ARABIC_INDIC_DIGITS = /[٠-٩۰-۹]/g

function toAsciiDigits(text: string): string {
  return text.replace(ARABIC_INDIC_DIGITS, (d) => String(d.charCodeAt(0) & 0xf))
}

/**
 * Parse a verse reference typed in the search box. Anything made only of
 * numbers (and a separator) is a reference; it's validated against the surah
 * metadata so out-of-range references get a clear message.
 */
export function parseReference(input: string, surahs: Surah[]): ReferenceResult {
  const text = toAsciiDigits(input).trim()
  const match = REFERENCE.exec(text)
  if (!match) return { kind: 'none' }

  // "25 " or "25:" while typing still means surah 25.
  const surahPart = match[1]!
  const ayahPart = match[2]
  const surah = Number(surahPart)
  const ayah = ayahPart === undefined ? undefined : Number(ayahPart)

  const target = resolveVerseTarget(String(surah), String(ayah ?? 1), surahs)
  if (!target.ok) return { kind: 'error', message: target.message }

  return {
    kind: 'ok',
    surah,
    ayah,
    label: ayah === undefined ? `Surah ${surah}` : `${surah}:${ayah}`,
    path: `/quran/${surah}/${ayah ?? 1}`,
  }
}
