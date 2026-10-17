import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Surah, Verse } from '../src/data/types'
import { buildFeed, resolveVerseTarget, scrollRowFor } from '../src/features/quran/feed'

const dataDir = join(import.meta.dirname, '..', 'src', 'data')
const read = <T>(name: string) => JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as T
const verses = read<Verse[]>('verses.json')
const surahs = read<Surah[]>('surahs.json')

describe('buildFeed', () => {
  const feed = buildFeed(verses, surahs)

  it('has one header per surah plus every verse', () => {
    expect(feed.rows).toHaveLength(6236 + 114)
    expect(feed.rows.filter((r) => r.kind === 'surah')).toHaveLength(114)
  })

  it('puts each surah header right before its first verse', () => {
    expect(feed.rows[0]).toMatchObject({ kind: 'surah', surah: { number: 1 } })
    expect(feed.rows[1]).toMatchObject({ kind: 'verse', verse: { key: '1:1' } })
    expect(feed.rows[8]).toMatchObject({ kind: 'surah', surah: { number: 2 } })
    expect(feed.headerRow.get(2)).toBe(8)
    expect(feed.verseRow.get('2:1')).toBe(9)
  })

  it('indexes every verse', () => {
    expect(feed.verseRow.size).toBe(6236)
    const row = feed.rows[feed.verseRow.get('2:255')!]
    expect(row).toMatchObject({ kind: 'verse', verse: { key: '2:255' }, surah: { name: 'Al-Baqarah' } })
    expect(feed.verseRow.get('114:6')).toBe(feed.rows.length - 1)
  })
})

describe('scrollRowFor', () => {
  const feed = buildFeed(verses, surahs)

  it('targets the surah header for verse 1', () => {
    expect(scrollRowFor(feed, '2:1')).toBe(feed.headerRow.get(2))
  })

  it('targets the verse row otherwise', () => {
    expect(scrollRowFor(feed, '2:255')).toBe(feed.verseRow.get('2:255'))
  })

  it('returns undefined for unknown verses', () => {
    expect(scrollRowFor(feed, '2:999')).toBeUndefined()
  })
})

describe('resolveVerseTarget', () => {
  it('accepts valid references', () => {
    expect(resolveVerseTarget('2', '255', surahs)).toEqual({ ok: true, key: '2:255' })
    expect(resolveVerseTarget('114', '6', surahs)).toEqual({ ok: true, key: '114:6' })
  })

  it('rejects a surah out of range', () => {
    expect(resolveVerseTarget('115', '1', surahs)).toMatchObject({ ok: false, message: /no surah 115/ })
  })

  it('rejects an ayah out of range', () => {
    expect(resolveVerseTarget('1', '8', surahs)).toMatchObject({ ok: false, message: /has 7 verses/ })
  })

  it('rejects non-numeric, zero and padded values', () => {
    for (const [s, a] of [
      ['abc', '1'],
      ['2', '0'],
      ['0', '1'],
      ['02', '1'],
      ['2', '1.5'],
    ] as const) {
      expect(resolveVerseTarget(s, a, surahs).ok, `${s}:${a}`).toBe(false)
    }
  })
})
