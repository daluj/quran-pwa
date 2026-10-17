// Build src/data/*.json from the raw Tanzil files in data/raw/.
// Run with `npm run data` (also runs before every `npm run build`).
// Exits with a non-zero code if validation fails.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildDataset, toJsonLines } from './quran-data.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const rawDir = join(root, 'data', 'raw')
const outDir = join(root, 'src', 'data')

try {
  const { verses, surahs, meta } = buildDataset(
    readFileSync(join(rawDir, 'quran-uthmani.txt'), 'utf8'),
    readFileSync(join(rawDir, 'en.translation.txt'), 'utf8'),
  )

  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'verses.json'), toJsonLines(verses))
  writeFileSync(join(outDir, 'surahs.json'), toJsonLines(surahs))
  writeFileSync(join(outDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`)

  console.log(`Quran data OK: ${meta.verseCount} verses, ${meta.surahCount} surahs, version ${meta.version}`)
} catch (error) {
  console.error('\nQuran data build FAILED\n')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
