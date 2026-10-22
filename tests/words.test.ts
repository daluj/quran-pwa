import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { hasWordAudio, splitWords, wordAudioUrl } from '../src/lib/words'

const verses = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'verses.json'), 'utf8')) as {
  key: string
  textArabic: string
}[]

describe('wordAudioUrl', () => {
  it('pads surah, ayah and position to three digits', () => {
    expect(wordAudioUrl(2, 101, 1)).toBe('https://audio.qurancdn.com/wbw/002_101_001.mp3')
    expect(wordAudioUrl(114, 6, 20)).toBe('https://audio.qurancdn.com/wbw/114_006_020.mp3')
  })
})

describe('splitWords', () => {
  it('splits a verse on spaces', () => {
    const verse = verses.find((v) => v.key === '2:101')!
    expect(splitWords(verse.textArabic)).toHaveLength(22)
    expect(splitWords('بسم  الله')).toEqual(['بسم', 'الله'])
  })

  it('finds 77,433 words in the whole Quran, none of them only marks', () => {
    const words = verses.flatMap((v) => splitWords(v.textArabic))
    expect(words).toHaveLength(77433)
    expect(words.every((w) => /[ء-يٱ]/.test(w))).toBe(true)
  })
})

describe('hasWordAudio', () => {
  it('is false only for the verses whose count differs from the audio', () => {
    expect(hasWordAudio('2:101')).toBe(true)
    expect(hasWordAudio('37:130')).toBe(false)
  })
})
