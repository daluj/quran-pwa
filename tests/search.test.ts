import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Verse } from '../src/data/types'
import { buildSearchIndex, highlightRanges, parseQuery, searchVerses, type SearchQuery } from '../src/lib/search'

const verses = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'verses.json'), 'utf8'),
) as Verse[]
const index = buildSearchIndex(verses, 'en')
const indexEs = buildSearchIndex(verses, 'es')
const verse = (key: string) => verses.find((v) => v.key === key)!

function search(input: string): string[] {
  const query = parseQuery(input)
  return query ? searchVerses(index, query).map((v) => v.key) : []
}

/** The highlighted substrings of `text`. */
function marks(text: string, input: string): string[] {
  return highlightRanges(text, parseQuery(input)!).map(([s, e]) => text.slice(s, e))
}

describe('parseQuery', () => {
  it('detects the script and normalizes terms', () => {
    expect(parseQuery('  Mercy   Merciful ')).toMatchObject({ script: 'latin', terms: ['mercy', 'merciful'] })
    expect(parseQuery('رَحْمَةٌ')).toMatchObject({ script: 'arabic', terms: ['رحمه'] })
    expect(parseQuery('رحمة رحمة')?.terms).toHaveLength(1)
  })

  it('ignores queries that are too short', () => {
    expect(parseQuery('a')).toBeNull()
    expect(parseQuery('   ')).toBeNull()
    expect(parseQuery('ر')).toBeNull()
  })
})

describe('searching the translation', () => {
  it('is case- and accent-insensitive', () => {
    expect(search('ALMIGHTY, THE MERCIFUL')).toContain('1:1')
    expect(search('lórd of the worlds')).toContain('1:2')
  })

  it('searches the Spanish translation, ignoring case and accents', () => {
    const spanish = (input: string) => searchVerses(indexEs, parseQuery(input)!).map((v) => v.key)
    const results = spanish('ORACION')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((k) => /oraci[oó]n/i.test(verse(k).translations.es))).toBe(true)
    expect(spanish('señor de los mundos')).toContain('1:2')
    expect(spanish('lord of the worlds')).not.toContain('1:2')
  })

  it('finds Arabic the same in both languages', () => {
    const query = parseQuery('الحمد لله')!
    expect(searchVerses(indexEs, query)).toEqual(searchVerses(index, query))
  })

  it('highlights accented Spanish words', () => {
    const text = verse('1:2').translations.es
    expect(marks(text, 'senor')).toEqual(['Señor'])
  })

  it('requires every word, in any order', () => {
    const results = search('worlds lord')
    expect(results).toContain('1:2')
    expect(results.every((k) => /lord/i.test(verse(k).translations.en) && /worlds/i.test(verse(k).translations.en))).toBe(
      true,
    )
  })

  it('returns verses in Quran order', () => {
    const results = search('mercy')
    expect(results.length).toBeGreaterThan(50)
    const order = results.map((k) => verses.indexOf(verse(k)))
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })
})

describe('searching the Arabic', () => {
  it('ignores diacritics', () => {
    expect(search('الحمد لله رب العلمين')).toContain('1:2')
    expect(search('ٱلْحَمْدُ لِلَّهِ')).toContain('1:2')
  })

  it('treats alif forms, ta marbuta and alif maqsura as equal', () => {
    // 1:6 has ٱهْدِنَا (alif wasla); typing a plain or hamza alif finds it.
    expect(search('اهدنا')).toContain('1:6')
    expect(search('أهدنا')).toContain('1:6')
    // 2:157 has رَحْمَةٌ (ta marbuta); typing it with ha finds it.
    expect(search('رحمه')).toContain('2:157')
    expect(search('رحمة')).toContain('2:157')
    // 2:2 has هُدًى (alif maqsura); typing ya finds it.
    expect(search('هدي للمتقين')).toContain('2:2')
    expect(search('هدى للمتقين')).toContain('2:2')
  })

  it('matches everyday spelling against Uthmani spelling', () => {
    // Dagger alif: ٱلْعَٰلَمِينَ (1:2) and ٱلرَّحْمَٰنِ (1:1).
    expect(search('العالمين')).toContain('1:2')
    expect(search('العلمين')).toContain('1:2')
    expect(search('الرحمن الرحيم')).toContain('1:1')
    expect(search('الرحمان الرحيم')).toContain('1:1')
    // Hamza: يَسْـَٔلُونَكَ (2:189) and ءَامَنُوا۟ (2:9).
    expect(search('يسألونك عن الأهلة')).toContain('2:189')
    expect(search('آمنوا')).toContain('2:9')
    expect(search('ءامنوا')).toContain('2:9')
  })

  it('still requires a typed alif to be there', () => {
    // 112:1 is قُلْ هُوَ ٱللَّهُ أَحَدٌ: "say", not "said".
    expect(search('قل هو الله احد')).toContain('112:1')
    expect(search('قال هو الله احد')).not.toContain('112:1')
  })

  it('only searches the Arabic text for Arabic queries', () => {
    expect(search('الله').length).toBeGreaterThan(1000)
    expect(search('god').every((k) => !verse(k).textArabicPlain.includes('god'))).toBe(true)
  })
})

describe('highlightRanges', () => {
  it('marks every occurrence of each term in the original text', () => {
    expect(marks('The Almighty, the Merciful.', 'the merciful')).toEqual(['The', 'the Merciful'])
  })

  it('maps accent-insensitive matches back to the original characters', () => {
    expect(marks('Café and cafe', 'cafe')).toEqual(['Café', 'cafe'])
    expect(marks('Café au lait', 'cafe')).toEqual(['Café'])
  })

  it('widens Arabic matches to whole words, diacritics included', () => {
    const text = verse('1:2').textArabic
    expect(marks(text, 'حمد')).toEqual([text.split(' ')[0]])
    expect(marks(text, 'رب العلمين')).toEqual([text.split(' ').slice(2).join(' ')])
    expect(marks(text, 'رب العالمين')).toEqual([text.split(' ').slice(2).join(' ')])
  })

  it('returns no ranges when nothing matches', () => {
    const query: SearchQuery = { script: 'latin', terms: ['zzz'], patterns: [] }
    expect(highlightRanges('nothing here', query)).toEqual([])
  })
})
