import 'fake-indexeddb/auto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Verse } from '../src/data/types'
import { QuranDB } from '../src/db/db'
import {
  cancelDownload,
  DOWNLOAD_FAILED,
  refreshDownloadStatus,
  removeDownload,
  startDownload,
  STORAGE_FULL,
} from '../src/lib/wordAudioDownloads'
import { OFFLINE_CACHE, surahWordFiles } from '../src/lib/wordAudioPlan'
import { playWord } from '../src/lib/wordAudio'

const verses = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'verses.json'), 'utf8')) as Verse[]
const SURAH = 112
const files = surahWordFiles(verses.filter((v) => v.surah === SURAH))
const WORD_BYTES = 1000

let db: QuranDB
let n = 0
let stores: Map<string, Map<string, Response>>
let fetchMock: ReturnType<typeof vi.fn>

function fakeCaches() {
  stores = new Map()
  const open = async (name: string) => {
    const store = stores.get(name) ?? new Map<string, Response>()
    stores.set(name, store)
    return {
      put: async (url: string, response: Response) => void store.set(url, response),
      keys: async () => [...store.keys()].map((url) => ({ url })),
      match: async (request: string | { url: string }) =>
        store.get(typeof request === 'string' ? request : request.url)?.clone(),
      delete: async (url: string) => store.delete(url),
    }
  }
  vi.stubGlobal('caches', { open, match: async (url: string, opts: { cacheName: string }) => (await open(opts.cacheName)).match(url) })
}

const word = () => new Response(new Blob([new Uint8Array(WORD_BYTES)]), { status: 200 })
const saved = () => stores.get(OFFLINE_CACHE) ?? new Map()

beforeEach(async () => {
  db = new QuranDB(`downloads-${n++}`)
  await db.verses.bulkAdd(verses.filter((v) => v.surah === SURAH))
  fakeCaches()
  fetchMock = vi.fn(async () => word())
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(async () => {
  vi.unstubAllGlobals()
  await db.delete()
})

describe('startDownload', () => {
  it('saves every word in the offline cache and records the surah as complete', async () => {
    await startDownload(SURAH, db)
    expect(saved().size).toBe(files.length)
    expect(fetchMock).toHaveBeenCalledTimes(files.length)
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ cache: 'no-store' })
    expect(await db.wordAudioDownloads.get(SURAH)).toMatchObject({
      status: 'complete',
      words: files.length,
      bytes: files.length * WORD_BYTES,
    })
  })

  it('resumes by fetching only the missing words', async () => {
    const cache = await caches.open(OFFLINE_CACHE)
    for (const file of files.slice(0, 5)) await cache.put(file.url, word())
    await db.wordAudioDownloads.put({ surah: SURAH, status: 'partial', words: 5, bytes: 5 * WORD_BYTES, updatedAt: 1 })
    await startDownload(SURAH, db)
    expect(fetchMock).toHaveBeenCalledTimes(files.length - 5)
    expect(await db.wordAudioDownloads.get(SURAH)).toMatchObject({ status: 'complete', bytes: files.length * WORD_BYTES })
  })

  it('keeps the saved words when cancelled and records the surah as partial', async () => {
    let calls = 0
    fetchMock.mockImplementation(async () => {
      if (++calls === 6) cancelDownload()
      return word()
    })
    await startDownload(SURAH, db)
    const row = (await db.wordAudioDownloads.get(SURAH))!
    expect(row.status).toBe('partial')
    expect(row.words).toBe(saved().size)
    expect(saved().size).toBeGreaterThan(0)
    expect(saved().size).toBeLessThan(files.length)
  })

  it('retries a word that fails once', async () => {
    let failed = false
    fetchMock.mockImplementation(async (url: string) => {
      if (url === files[0]!.url && !failed) {
        failed = true
        throw new TypeError('network')
      }
      return word()
    })
    await startDownload(SURAH, db)
    expect((await db.wordAudioDownloads.get(SURAH))!.status).toBe('complete')
  })

  it('stops with an error when a word keeps failing, keeping what was saved', async () => {
    fetchMock.mockImplementation(async (url: string) => (url === files[10]!.url ? new Response('', { status: 404 }) : word()))
    await startDownload(SURAH, db)
    const row = (await db.wordAudioDownloads.get(SURAH))!
    expect(row.status).toBe('partial')
    expect(saved().has(files[10]!.url)).toBe(false)
    expect(DOWNLOAD_FAILED).toMatch(/kept/)
  }, 15000)

  it('stops on a storage error and leaves the surah partial', async () => {
    const real = await caches.open(OFFLINE_CACHE)
    let puts = 0
    const put = real.put
    vi.stubGlobal('caches', {
      open: async () => ({
        ...real,
        put: async (url: string, response: Response) => {
          if (++puts === 4) throw new DOMException('full', 'QuotaExceededError')
          return put(url, response)
        },
        keys: real.keys,
      }),
    })
    await startDownload(SURAH, db)
    const row = (await db.wordAudioDownloads.get(SURAH))!
    expect(row.status).toBe('partial')
    // Words being saved by the other workers when the error hit still finish.
    expect(saved().size).toBeGreaterThanOrEqual(3)
    expect(saved().size).toBeLessThan(files.length)
    expect(row.words).toBe(saved().size)
    expect(STORAGE_FULL).toMatch(/storage/)
  })
})

describe('removeDownload', () => {
  it('empties the cache and removes the row', async () => {
    await startDownload(SURAH, db)
    await removeDownload(SURAH, db)
    expect(saved().size).toBe(0)
    expect(await db.wordAudioDownloads.get(SURAH)).toBeUndefined()
  })
})

describe('refreshDownloadStatus', () => {
  const totals = new Map([[SURAH, files.length]])

  it('drops a row whose files are gone', async () => {
    await db.wordAudioDownloads.put({ surah: SURAH, status: 'complete', words: files.length, bytes: 1, updatedAt: 1 })
    await refreshDownloadStatus(totals, db)
    expect(await db.wordAudioDownloads.get(SURAH)).toBeUndefined()
  })

  it('turns a complete row with missing files into a partial one', async () => {
    await startDownload(SURAH, db)
    const cache = await caches.open(OFFLINE_CACHE)
    await cache.delete(files[0]!.url)
    await refreshDownloadStatus(totals, db)
    expect(await db.wordAudioDownloads.get(SURAH)).toMatchObject({
      status: 'partial',
      words: files.length - 1,
      bytes: (files.length - 1) * WORD_BYTES,
    })
  })

  it('leaves rows that match the cache and surahs from a backup alone', async () => {
    await startDownload(SURAH, db)
    await db.wordAudioDownloads.put({ surah: 5, status: 'wanted', words: 0, bytes: 0, updatedAt: 1 })
    const before = await db.wordAudioDownloads.toArray()
    await refreshDownloadStatus(totals, db)
    expect(await db.wordAudioDownloads.toArray()).toEqual(before)
  })
})

describe('player', () => {
  it('plays a downloaded word from the offline cache without calling fetch', async () => {
    class FakeAudio {
      src = ''
      addEventListener() {}
      play() {
        return Promise.resolve()
      }
      pause() {}
    }
    vi.stubGlobal('Audio', FakeAudio)
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const cache = await caches.open(OFFLINE_CACHE)
    await cache.put(files[0]!.url, word())
    playWord(`${SURAH}:1`, 1)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})
