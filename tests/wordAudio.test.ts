// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { playWord, stopWord, usePlayingWord, useWordAudioError, WORD_AUDIO_ERROR } from '../src/lib/wordAudio'

const players: FakeAudio[] = []

class FakeAudio {
  src = ''
  paused = true
  private listeners: Record<string, (() => void)[]> = {}
  constructor() {
    players.push(this)
  }
  addEventListener(type: string, listener: () => void) {
    ;(this.listeners[type] ??= []).push(listener)
  }
  play() {
    this.paused = false
    return Promise.resolve()
  }
  pause() {
    this.paused = true
  }
  reset() {
    this.src = ''
    this.paused = true
  }
  emit(type: string) {
    this.listeners[type]?.forEach((listener) => listener())
  }
}

const flush = () => act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
})

// The player creates its <audio> element once and keeps it, so the fake is
// created once too; each test starts from a fresh state.
vi.stubGlobal('Audio', FakeAudio)

beforeEach(() => {
  players[0]?.reset()
  vi.stubGlobal('fetch', vi.fn(async () => new Response(new Blob(['mp3']), { status: 200 })))
  URL.createObjectURL = vi.fn(() => 'blob:word')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  act(() => stopWord())
})

describe('word audio player', () => {
  it('downloads and plays the word, then reports it as playing', async () => {
    const { result } = renderHook(() => usePlayingWord('2:101'))
    act(() => playWord('2:101', 3))
    expect(result.current).toBe(3)
    await flush()
    expect(fetch).toHaveBeenCalledWith('https://audio.qurancdn.com/wbw/002_101_003.mp3')
    expect(players[0]!.src).toBe('blob:word')
    expect(players[0]!.paused).toBe(false)
  })

  it('plays one word at a time', async () => {
    const first = renderHook(() => usePlayingWord('1:1'))
    const second = renderHook(() => usePlayingWord('1:2'))
    act(() => playWord('1:1', 1))
    await flush()
    act(() => playWord('1:2', 2))
    expect(first.result.current).toBeUndefined()
    expect(second.result.current).toBe(2)
    await flush()
    expect(players).toHaveLength(1)
  })

  it('stops when the playing word is tapped again, and plays it again after that', async () => {
    const { result } = renderHook(() => usePlayingWord('1:1'))
    act(() => playWord('1:1', 1))
    await flush()
    act(() => playWord('1:1', 1))
    expect(result.current).toBeUndefined()
    expect(players[0]!.paused).toBe(true)
    act(() => playWord('1:1', 1))
    expect(result.current).toBe(1)
  })

  it('clears the playing word when the audio ends', async () => {
    const { result } = renderHook(() => usePlayingWord('1:1'))
    act(() => playWord('1:1', 1))
    await flush()
    act(() => players[0]!.emit('ended'))
    expect(result.current).toBeUndefined()
  })

  it('does not play a word that was stopped while downloading', async () => {
    renderHook(() => usePlayingWord('1:1'))
    act(() => playWord('1:1', 1))
    act(() => stopWord())
    await flush()
    expect(players[0]!.paused).toBe(true)
    expect(players[0]!.src).toBe('')
  })

  it('reports an error when the download fails, and clears it on the next tap', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))))
    const { result } = renderHook(() => ({ error: useWordAudioError(), playing: usePlayingWord('1:1') }))
    act(() => playWord('1:1', 1))
    await flush()
    expect(result.current).toEqual({ error: WORD_AUDIO_ERROR, playing: undefined })
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Blob(['mp3']), { status: 200 })))
    act(() => playWord('1:1', 1))
    expect(result.current.error).toBeUndefined()
    await flush()
  })

  it('reports an error for a missing file', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
    const { result } = renderHook(() => useWordAudioError())
    act(() => playWord('1:1', 1))
    await flush()
    expect(result.current).toBe(WORD_AUDIO_ERROR)
  })
})
