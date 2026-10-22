import { hasWordAudio, splitWords, wordAudioUrl } from './words'

/** Cache Storage cache holding downloaded surahs (never trimmed, unlike `word-audio`). */
export const OFFLINE_CACHE = 'word-audio-offline'

/** Average size of the sampled word files (they range from about 25 to 120 KB). */
export const AVERAGE_WORD_BYTES = 55 * 1024
export const WARN_BYTES = 100 * 1024 * 1024

export interface WordFile {
  ayah: number
  position: number
  url: string
}

interface VerseText {
  key: string
  surah: number
  ayah: number
  textArabic: string
}

/** Every word file of a surah's verses, skipping verses without word audio. */
export function surahWordFiles(verses: VerseText[]): WordFile[] {
  return verses
    .filter((verse) => hasWordAudio(verse.key))
    .sort((a, b) => a.ayah - b.ayah)
    .flatMap((verse) =>
      splitWords(verse.textArabic).map((_, i) => ({
        ayah: verse.ayah,
        position: i + 1,
        url: wordAudioUrl(verse.surah, verse.ayah, i + 1),
      })),
    )
}

/** Words with audio in each surah. */
export function wordCountsBySurah(verses: VerseText[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const verse of verses) {
    if (!hasWordAudio(verse.key)) continue
    counts.set(verse.surah, (counts.get(verse.surah) ?? 0) + splitWords(verse.textArabic).length)
  }
  return counts
}

export function estimateBytes(words: number): number {
  return words * AVERAGE_WORD_BYTES
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export interface DownloadEnvironment {
  /** Free storage the browser reports (quota minus usage). */
  freeBytes?: number
  /** Data Saver is on. */
  saveData?: boolean
  /** `navigator.connection.type`, where the browser reports it. */
  connectionType?: string
}

/** Why the user should confirm a download first, or undefined when it can just start. */
export function downloadWarning(estimate: number, env: DownloadEnvironment): string | undefined {
  if (env.freeBytes !== undefined && estimate > env.freeBytes) {
    return `This is more than the ${formatBytes(Math.max(env.freeBytes, 0))} of free storage the browser reports.`
  }
  if (env.saveData || env.connectionType === 'cellular') {
    return 'You seem to be on a metered connection or have Data Saver on.'
  }
  if (estimate > WARN_BYTES) return 'This is a large download.'
  return undefined
}
