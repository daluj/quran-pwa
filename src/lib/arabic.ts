// Arabic text normalization used both at build time (to produce
// `textArabicPlain`) and at runtime (to normalize search queries the same way).

// Harakat, tanween, shadda, sukun, superscript alef, Quranic annotation signs
// (small high letters, pause marks, rub el hizb, sajda), and tatweel.
const DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g

/** Remove diacritics and Quranic marks, keeping the base letters. */
export function stripDiacritics(text: string): string {
  return text.replace(DIACRITICS, '')
}

/**
 * Normalize Arabic for search: strip diacritics, unify alif forms
 * (أ إ آ ٱ ٲ ٳ → ا), ta marbuta (ة → ه), alif maqsura (ى → ي), and collapse
 * whitespace.
 */
export function normalizeArabic(text: string): string {
  return stripDiacritics(text)
    .replace(/[آأإٱٲٳ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
}
