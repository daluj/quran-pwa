import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildDataset,
  DataValidationError,
  EXPECTED_SURAHS,
  EXPECTED_VERSES,
  parseTanzil,
  stripBismillah,
} from '../scripts/quran-data.ts'

const raw = (name: string) => readFileSync(join(import.meta.dirname, '..', 'data', 'raw', name), 'utf8')
const realTranslations = () => ({ en: raw('en.translation.txt'), es: raw('es.translation.txt') })

/** A complete, valid file with fake text: 114 surahs of the real lengths. */
function syntheticFile(text: (s: number, a: number) => string = (s, a) => `verse ${s}:${a}`): string {
  const lengths = buildDataset(raw('quran-uthmani.txt'), { en: raw('en.translation.txt'), es: raw('en.translation.txt') }).surahs.map((s) => s.verseCount)
  const lines: string[] = []
  lengths.forEach((n, i) => {
    for (let a = 1; a <= n; a++) lines.push(`${i + 1}|${a}|${text(i + 1, a)}`)
  })
  return lines.join('\n')
}

describe('parseTanzil', () => {
  it('accepts a valid file and ignores # comments and blank lines', () => {
    const verses = parseTanzil(`${syntheticFile()}\n\n# license footer\n#\n`, 'test')
    expect(verses.size).toBe(EXPECTED_VERSES)
    expect(verses.get('2:255')?.text).toBe('verse 2:255')
  })

  it('strips a UTF-8 BOM and handles CRLF', () => {
    const verses = parseTanzil(`\uFEFF${syntheticFile().replace(/\n/g, '\r\n')}`, 'test')
    expect(verses.get('1:1')?.text).toBe('verse 1:1')
    expect(verses.get('114:6')?.text).toBe('verse 114:6')
  })

  it('rejects a missing verse', () => {
    const content = syntheticFile()
      .split('\n')
      .filter((l) => !l.startsWith('2|255|'))
      .join('\n')
    expect(() => parseTanzil(content, 'test')).toThrow(/missing 2:255/)
  })

  it('rejects a duplicate verse', () => {
    expect(() => parseTanzil(`${syntheticFile()}\n2|255|again`, 'test')).toThrow(/duplicate 2:255/)
  })

  it('rejects empty text', () => {
    expect(() => parseTanzil(syntheticFile((s, a) => (s === 3 && a === 7 ? ' ' : 'x')), 'test')).toThrow(
      /empty text for 3:7/,
    )
  })

  it('rejects malformed lines', () => {
    expect(() => parseTanzil(`${syntheticFile()}\nnot a verse`, 'test')).toThrow(/malformed/)
  })

  it('rejects out-of-range surahs', () => {
    expect(() => parseTanzil(`${syntheticFile()}\n115|1|x`, 'test')).toThrow(DataValidationError)
  })
})

describe('stripBismillah', () => {
  const bismillah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'

  it('removes the prefix from verse 1 of surahs other than 1 and 9', () => {
    expect(stripBismillah(2, 1, `${bismillah} الٓمٓ`, bismillah)).toBe('الٓمٓ')
  })

  it('leaves 1:1, 9:1 and later verses untouched', () => {
    expect(stripBismillah(1, 1, bismillah, bismillah)).toBe(bismillah)
    expect(stripBismillah(9, 1, 'بَرَآءَةٌ', bismillah)).toBe('بَرَآءَةٌ')
    expect(stripBismillah(2, 2, `${bismillah} x`, bismillah)).toBe(`${bismillah} x`)
  })

  it('fails loudly when the expected prefix is missing', () => {
    expect(() => stripBismillah(2, 1, 'الٓمٓ', bismillah)).toThrow(/expected Bismillah/)
  })
})

describe('buildDataset with the real data/raw files', () => {
  const { verses, surahs, meta } = buildDataset(raw('quran-uthmani.txt'), realTranslations())

  it('has every verse and surah', () => {
    expect(verses).toHaveLength(EXPECTED_VERSES)
    expect(surahs).toHaveLength(EXPECTED_SURAHS)
    expect(surahs.reduce((sum, s) => sum + s.verseCount, 0)).toBe(EXPECTED_VERSES)
    expect(meta.version).toMatch(/^[0-9a-f]{12}$/)
  })

  it('keeps the known surah lengths', () => {
    expect(surahs[0]).toEqual({ number: 1, verseCount: 7, bismillah: false })
    expect(surahs[1]).toEqual({ number: 2, verseCount: 286, bismillah: true })
    expect(surahs[8]).toEqual({ number: 9, verseCount: 129, bismillah: false })
    expect(surahs[113]).toEqual({ number: 114, verseCount: 6, bismillah: true })
  })

  it('removes the Bismillah from every verse 1 except surah 1', () => {
    const plainBismillah = 'بسم الله الرحمن الرحيم'
    for (const v of verses.filter((v) => v.ayah === 1)) {
      expect(v.textArabicPlain.startsWith(plainBismillah), v.key).toBe(v.surah === 1)
    }
  })

  it('builds the expected record shape', () => {
    expect(verses.find((v) => v.key === '2:1')).toEqual({
      surah: 2,
      ayah: 1,
      key: '2:1',
      textArabic: 'الٓمٓ',
      textArabicPlain: 'الم',
      translations: { en: 'A. L. M.', es: 'Alif. Lam. Mim.' },
    })
  })

  it('fills both translations for every verse', () => {
    for (const v of verses) {
      expect(v.translations.en, v.key).not.toBe('')
      expect(v.translations.es, v.key).not.toBe('')
    }
    expect(verses.find((v) => v.key === '1:1')?.translations.es).toMatch(/Dios/)
  })

  it('has no bracketed or parenthesised words in the Spanish text', () => {
    expect(verses.filter((v) => /[()[\]]/.test(v.translations.es)).map((v) => v.key)).toEqual([])
  })

  it('fails naming the file when a translation is invalid', () => {
    const bad = syntheticFile().replace('114|6|', '114|7|')
    expect(() => buildDataset(raw('quran-uthmani.txt'), { ...realTranslations(), en: bad })).toThrow(
      /en\.translation\.txt.*\n.*missing 114:6/,
    )
    expect(() => buildDataset(raw('quran-uthmani.txt'), { ...realTranslations(), es: bad })).toThrow(
      /es\.translation\.txt.*\n.*missing 114:6/,
    )
  })
})
