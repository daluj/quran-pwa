// Check that every verse has as many word audio files as Tanzil has words.
// Run by hand with `npm run verify:word-audio` (it makes ~12,000 requests to
// the audio CDN, so it isn't part of CI). Verses that disagree are written to
// src/data/word-audio-exceptions.json and get no word audio in the app.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { splitWords, wordAudioUrl } from '../src/lib/words.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const verses = JSON.parse(readFileSync(join(root, 'src', 'data', 'verses.json'), 'utf8')) as {
  key: string
  surah: number
  ayah: number
  textArabic: string
}[]

const CONCURRENCY = 4
const RETRIES = 10

async function exists(url: string): Promise<boolean> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.status === 200) return true
      if (response.status === 404) return false
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      if (attempt >= RETRIES) throw new Error(`${url}: ${String(error)}`, { cause: error })
      await new Promise((resolve) => setTimeout(resolve, Math.min(500 * attempt, 5000)))
    }
  }
}

const mismatches: string[] = []
let next = 0

async function worker() {
  while (next < verses.length) {
    const verse = verses[next++]!
    const count = splitWords(verse.textArabic).length
    const [hasLast, hasExtra] = await Promise.all([
      exists(wordAudioUrl(verse.surah, verse.ayah, count)),
      exists(wordAudioUrl(verse.surah, verse.ayah, count + 1)),
    ])
    if (!hasLast || hasExtra) mismatches.push(verse.key)
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))

const order = (key: string) => key.split(':').map(Number) as [number, number]
mismatches.sort((a, b) => order(a)[0] - order(b)[0] || order(a)[1] - order(b)[1])
writeFileSync(join(root, 'src', 'data', 'word-audio-exceptions.json'), `${JSON.stringify(mismatches)}\n`)
console.log(`Word audio checked: ${verses.length} verses, ${mismatches.length} without a matching count`)
if (mismatches.length) console.log(mismatches.join(' '))
