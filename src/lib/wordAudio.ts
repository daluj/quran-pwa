import { useSyncExternalStore } from 'react'
import { wordAudioUrl } from './words'

// One shared <audio> element: only one word plays at a time, and a verse card
// subscribes to just its own playing position, so other cards don't re-render.

interface Playing {
  key: string
  position: number
}

interface Snapshot {
  playing: Playing | undefined
  error: string | undefined
}

export const WORD_AUDIO_ERROR =
  "This word couldn't be played. Without a connection, only words you have played before work."

let audio: HTMLAudioElement | undefined
let objectUrl: string | undefined
// Bumped on every play and stop, so a slow download of a word that was
// replaced or stopped doesn't start playing late.
let request = 0
let snapshot: Snapshot = { playing: undefined, error: undefined }
const listeners = new Set<() => void>()

function setSnapshot(next: Snapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function element(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio()
    audio.addEventListener('ended', () => setSnapshot({ playing: undefined, error: undefined }))
    audio.addEventListener('error', () => {
      if (audio?.src) setSnapshot({ playing: undefined, error: WORD_AUDIO_ERROR })
    })
  }
  return audio
}

function releaseObjectUrl() {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = undefined
}

/** Plays one word (1-based position); tapping the word that is playing stops it. */
export function playWord(verseKey: string, position: number) {
  const current = snapshot.playing
  if (current?.key === verseKey && current.position === position) {
    stopWord()
    return
  }
  const [surah, ayah] = verseKey.split(':').map(Number) as [number, number]
  const id = ++request
  const player = element()
  player.pause()
  setSnapshot({ playing: { key: verseKey, position }, error: undefined })
  // Downloaded as a whole file (not streamed by the <audio> element) so the
  // service worker caches it with a plain 200 response and it plays offline.
  void fetch(wordAudioUrl(surah, ayah, position))
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.blob()
    })
    .then((blob) => {
      if (id !== request) return
      releaseObjectUrl()
      objectUrl = URL.createObjectURL(blob)
      player.src = objectUrl
      return player.play()
    })
    .catch(() => {
      if (id === request) setSnapshot({ playing: undefined, error: WORD_AUDIO_ERROR })
    })
}

export function stopWord() {
  request++
  audio?.pause()
  if (snapshot.playing || snapshot.error) setSnapshot({ playing: undefined, error: undefined })
}

/** Position of the word playing in this verse, if any. */
export function usePlayingWord(verseKey: string): number | undefined {
  return useSyncExternalStore(subscribe, () =>
    snapshot.playing?.key === verseKey ? snapshot.playing.position : undefined,
  )
}

export function useWordAudioError(): string | undefined {
  return useSyncExternalStore(subscribe, () => snapshot.error)
}
