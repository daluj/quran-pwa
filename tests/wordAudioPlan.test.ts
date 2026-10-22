import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  AVERAGE_WORD_BYTES,
  downloadWarning,
  estimateBytes,
  formatBytes,
  surahWordFiles,
  wordCountsBySurah,
} from '../src/lib/wordAudioPlan'

const verses = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'verses.json'), 'utf8')) as {
  key: string
  surah: number
  ayah: number
  textArabic: string
}[]
const MB = 1024 * 1024

describe('word files of a surah', () => {
  it('lists every word of surah 1 in order', () => {
    const files = surahWordFiles(verses.filter((v) => v.surah === 1))
    expect(files).toHaveLength(29)
    expect(files[0]).toEqual({ ayah: 1, position: 1, url: 'https://audio.qurancdn.com/wbw/001_001_001.mp3' })
    expect(files.at(-1)!.url).toBe('https://audio.qurancdn.com/wbw/001_007_009.mp3')
  })

  it('skips verses whose word count differs from the audio', () => {
    const surah37 = verses.filter((v) => v.surah === 37)
    const all = surah37.reduce((sum, v) => sum + v.textArabic.split(' ').length, 0)
    const skipped = verses.find((v) => v.key === '37:130')!.textArabic.split(' ').length
    expect(surahWordFiles(surah37)).toHaveLength(all - skipped)
    expect(surahWordFiles(surah37).some((f) => f.ayah === 130)).toBe(false)
  })

  it('counts the words of all 114 surahs', () => {
    const counts = wordCountsBySurah(verses)
    expect(counts.size).toBe(114)
    expect(counts.get(1)).toBe(29)
    // 6,117 words, minus the 14 of 2:181, which has no word audio.
    expect(counts.get(2)).toBe(6103)
  })
})

describe('size', () => {
  it('estimates 55 KB per word', () => {
    expect(estimateBytes(100)).toBe(100 * AVERAGE_WORD_BYTES)
  })

  it('formats KB, MB and GB', () => {
    expect(formatBytes(20 * 1024)).toBe('20 KB')
    expect(formatBytes(335 * MB)).toBe('335 MB')
    expect(formatBytes(4.3 * 1024 * MB)).toBe('4.3 GB')
  })
})

describe('downloadWarning', () => {
  it('warns above 100 MB', () => {
    expect(downloadWarning(150 * MB, {})).toMatch(/large/)
  })

  it('warns when the estimate is more than the free storage', () => {
    expect(downloadWarning(50 * MB, { freeBytes: 10 * MB })).toMatch(/free storage/)
  })

  it('warns with Data Saver or a cellular connection', () => {
    expect(downloadWarning(20 * MB, { saveData: true })).toMatch(/metered/)
    expect(downloadWarning(20 * MB, { connectionType: 'cellular' })).toMatch(/metered/)
  })

  it('lets a small download on a normal connection start', () => {
    expect(downloadWarning(20 * MB, { freeBytes: 5000 * MB, connectionType: 'wifi' })).toBeUndefined()
  })
})
