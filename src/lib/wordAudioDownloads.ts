import { useSyncExternalStore } from 'react'
import { db, type QuranDB } from '../db/db'
import { removeDownloadRow, saveDownload } from '../db/wordAudioDownloads'
import { OFFLINE_CACHE, surahWordFiles, type WordFile } from './wordAudioPlan'

// Downloads one surah's word audio into its own cache while the app is open.
// The cache is the truth for what is on the device; the Dexie rows summarize it.

const CONCURRENCY = 4
const RETRIES = 3
const SAVE_EVERY = 50
const PUBLISH_EVERY = 10

export interface DownloadProgress {
  surah: number
  done: number
  total: number
  bytes: number
}

interface Snapshot {
  active: DownloadProgress | undefined
  error: { surah: number; message: string } | undefined
}

export const STORAGE_FULL = 'Not enough storage. The words saved so far are kept.'
export const DOWNLOAD_FAILED = "The download stopped because a word couldn't be fetched. The words saved so far are kept."

let snapshot: Snapshot = { active: undefined, error: undefined }
let controller: AbortController | undefined
const listeners = new Set<() => void>()

function publish(next: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Progress of this surah's download, if it is the one running. */
export function useDownloadProgress(surah: number): DownloadProgress | undefined {
  return useSyncExternalStore(subscribe, () => (snapshot.active?.surah === surah ? snapshot.active : undefined))
}

/** The surah being downloaded, if any. */
export function useActiveDownload(): number | undefined {
  return useSyncExternalStore(subscribe, () => snapshot.active?.surah)
}

export function useDownloadError(): Snapshot['error'] {
  return useSyncExternalStore(subscribe, () => snapshot.error)
}

export function dismissDownloadError() {
  publish({ error: undefined })
}

async function surahFiles(surah: number, database: QuranDB): Promise<WordFile[]> {
  return surahWordFiles(await database.verses.where('surah').equals(surah).toArray())
}

async function fetchWord(url: string, signal: AbortSignal): Promise<Blob> {
  for (let attempt = 1; ; attempt++) {
    try {
      // no-store keeps the service worker's on-demand cache out of this.
      const response = await fetch(url, { cache: 'no-store', signal })
      if (response.status !== 200) throw new Error(`HTTP ${response.status}`)
      return await response.blob()
    } catch (error) {
      if (signal.aborted || attempt >= RETRIES) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }
}

const isQuotaError = (error: unknown) => error instanceof DOMException && error.name === 'QuotaExceededError'

/** Download the surah's missing words; words already in the cache are kept (resume). */
export async function startDownload(surah: number, database: QuranDB = db): Promise<void> {
  if (snapshot.active) return
  const files = await surahFiles(surah, database)
  const cache = await caches.open(OFFLINE_CACHE)
  const cached = new Set((await cache.keys()).map((request) => request.url))
  const missing = files.filter((file) => !cached.has(file.url))
  const previous = await database.wordAudioDownloads.get(surah)

  controller = new AbortController()
  const { signal } = controller
  const progress: DownloadProgress = {
    surah,
    done: files.length - missing.length,
    total: files.length,
    bytes: previous && previous.status !== 'wanted' ? previous.bytes : 0,
  }
  publish({ active: { ...progress }, error: undefined })

  let failure: string | undefined
  let sinceSave = 0
  const queue = [...missing]

  const save = () =>
    saveDownload(
      {
        surah,
        status: progress.done === progress.total ? 'complete' : 'partial',
        words: progress.done,
        bytes: progress.bytes,
      },
      database,
    )

  async function worker() {
    while (!signal.aborted && !failure) {
      const file = queue.shift()
      if (!file) return
      try {
        const blob = await fetchWord(file.url, signal)
        await cache.put(
          file.url,
          new Response(blob, { headers: { 'content-type': 'audio/mpeg', 'content-length': String(blob.size) } }),
        )
        progress.done++
        progress.bytes += blob.size
        if (progress.done % PUBLISH_EVERY === 0) publish({ active: { ...progress } })
        if (++sinceSave >= SAVE_EVERY) {
          sinceSave = 0
          await save()
        }
      } catch (error) {
        if (signal.aborted) return
        failure = isQuotaError(error) ? STORAGE_FULL : DOWNLOAD_FAILED
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    if (progress.done > 0 || previous) {
      if (progress.done === 0) await database.wordAudioDownloads.put({ ...previous!, updatedAt: Date.now() })
      else await save()
    }
  } finally {
    controller = undefined
    publish({ active: undefined, error: failure ? { surah, message: failure } : undefined })
  }
}

export function cancelDownload() {
  controller?.abort()
}

/** Delete the surah's saved words and its row. */
export async function removeDownload(surah: number, database: QuranDB = db): Promise<void> {
  if (snapshot.active?.surah === surah) return
  const cache = await caches.open(OFFLINE_CACHE)
  await Promise.all((await surahFiles(surah, database)).map((file) => cache.delete(file.url)))
  await removeDownloadRow(surah, database)
}

const SURAH_IN_URL = /\/wbw\/(\d{3})_\d{3}_\d{3}\.mp3$/

/**
 * Fix the rows to match the cache, which the browser may have cleared or a
 * crash may have left behind. `totals` is the word count of each surah.
 */
export async function refreshDownloadStatus(totals: Map<number, number>, database: QuranDB = db): Promise<void> {
  if (snapshot.active) return
  const cache = await caches.open(OFFLINE_CACHE)
  const counts = new Map<number, number>()
  for (const request of await cache.keys()) {
    const match = SURAH_IN_URL.exec(request.url)
    if (match) counts.set(Number(match[1]), (counts.get(Number(match[1])) ?? 0) + 1)
  }
  for (const row of await database.wordAudioDownloads.toArray()) {
    if (row.status === 'wanted') continue
    const total = totals.get(row.surah) ?? 0
    const count = counts.get(row.surah) ?? 0
    if (count === 0) {
      await removeDownloadRow(row.surah, database)
    } else if (count !== row.words || (count === total) !== (row.status === 'complete')) {
      await saveDownload(
        { surah: row.surah, status: count >= total ? 'complete' : 'partial', words: count, bytes: await measure(cache, row.surah) },
        database,
      )
    }
  }
}

async function measure(cache: Cache, surah: number): Promise<number> {
  let bytes = 0
  for (const request of await cache.keys()) {
    if (SURAH_IN_URL.exec(request.url)?.[1] !== String(surah).padStart(3, '0')) continue
    bytes += Number((await cache.match(request))?.headers.get('content-length') ?? 0)
  }
  return bytes
}
