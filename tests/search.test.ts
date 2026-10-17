import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Verse } from '../src/data/types'
import { buildSearchIndex, highlightRanges, parseQuery, searchVerses, type SearchQuery } from '../src/lib/search'

const verses = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'verses.json'), 'utf8'),
) as Verse[]
const index = buildSearchIndex(verses)
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
    expect(parseQuery('  Mercy   Merciful ')).toEqual({ script: 'latin', terms: ['mercy', 'merciful'] })
    expect(parseQuery('الرَّحْمَٰنِ')).toEqual({ script: 'arabic', terms: ['الرحمن'] })
    expect(parseQuery('رحمة رحمة')).toEqual({ script: 'arabic', terms: ['رحمه'] })
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

  it('requires every word, in any order', () => {
    const results = search('worlds lord')
    expect(results).toContain('1:2')
    expect(results.every((k) => /lord/i.test(verse(k).translation) && /worlds/i.test(verse(k).translation))).toBe(
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
  })

  it('returns no ranges when nothing matches', () => {
    const query: SearchQuery = { script: 'latin', terms: ['zzz'] }
    expect(highlightRanges('nothing here', query)).toEqual([])
  })
})
