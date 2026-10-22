import { useEffect } from 'react'
import { stopWord, useWordAudioError } from '../../lib/wordAudio'

/** Tells the user when a word's audio couldn't be played; also stops audio on leaving the feed. */
export function WordAudioNotice() {
  const error = useWordAudioError()

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') stopWord()
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      stopWord()
    }
  }, [])

  if (!error) return null
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-fg px-4 py-3 text-bg shadow-lg sm:bottom-6"
    >
      <p className="flex-1 text-[15px]">{error}</p>
      <button
        type="button"
        onClick={stopWord}
        className="rounded-full px-3 py-2 text-[15px] font-bold opacity-80 hover:opacity-100"
      >
        OK
      </button>
    </div>
  )
}
