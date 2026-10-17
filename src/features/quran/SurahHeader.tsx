import { memo } from 'react'
import type { Surah } from '../../data/types'

interface SurahHeaderProps {
  surah: Surah
  bismillah: string
}

/** Feed row that opens each surah: number, name, verse count and Bismillah. */
export const SurahHeader = memo(function SurahHeader({ surah, bismillah }: SurahHeaderProps) {
  return (
    <section
      aria-label={`Surah ${surah.number}, ${surah.name}, ${surah.verseCount} verses`}
      className="border-b border-border bg-surface px-4 pt-6 pb-4 text-center"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-full border-2 border-accent text-sm font-bold text-accent">
        {surah.number}
      </span>
      <h2 className="mt-2 text-2xl font-extrabold">{surah.name}</h2>
      <p className="text-sm text-muted">
        Surah {surah.number} · {surah.verseCount} {surah.verseCount === 1 ? 'verse' : 'verses'}
      </p>
      {surah.bismillah && (
        <p lang="ar" className="quran-text mt-3 text-center!">
          {bismillah}
        </p>
      )}
    </section>
  )
})
