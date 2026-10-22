import exceptions from '../data/word-audio-exceptions.json'

const WORD_AUDIO_BASE = 'https://audio.qurancdn.com/wbw/'

/** Verses whose word count differs from the audio's (see `npm run verify:word-audio`). */
const NO_WORD_AUDIO = new Set<string>(exceptions)

/** The Arabic words of a verse; position n (1-based) is the audio file n. */
export function splitWords(textArabic: string): string[] {
  return textArabic.split(' ').filter(Boolean)
}

/** URL of one word's audio: surah, ayah and position zero-padded to 3 digits. */
export function wordAudioUrl(surah: number, ayah: number, position: number): string {
  const pad = (n: number) => String(n).padStart(3, '0')
  return `${WORD_AUDIO_BASE}${pad(surah)}_${pad(ayah)}_${pad(position)}.mp3`
}

export function hasWordAudio(verseKey: string): boolean {
  return !NO_WORD_AUDIO.has(verseKey)
}
