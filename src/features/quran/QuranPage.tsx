import { useLiveQuery } from 'dexie-react-hooks'
import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { DataGate } from '../../components/DataGate'
import { Header } from '../../components/layout/Header'
import type { Surah } from '../../data/types'
import { useBookmarks } from '../../db/bookmarks'
import { db } from '../../db/db'
import { resolveVerseTarget } from './feed'
import { QuickActions } from './QuickActions'
import { QuranFeed } from './QuranFeed'
import { useFeed } from './useFeed'

/** Quran section: the full feed, opened at `/quran` or `/quran/:surah/:ayah`. */
export function QuranPage() {
  const params = useParams()
  const location = useLocation()
  const bookmarks = useBookmarks()
  const surahs = useLiveQuery(() => db.surahs.orderBy('number').toArray(), [])
  const [topSurah, setTopSurah] = useState<Surah>()

  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setHeaderHeight(el.offsetHeight))
    observer.observe(el)
    setHeaderHeight(el.offsetHeight)
    return () => observer.disconnect()
  }, [])

  // `/quran/2` opens the start of surah 2.
  const target =
    params.surah && surahs ? resolveVerseTarget(params.surah, params.ayah ?? '1', surahs) : undefined

  return (
    <>
      <Header
        ref={headerRef}
        title={topSurah ? `Surah ${topSurah.number}` : 'Quran'}
        subtitle={topSurah ? `${topSurah.verseCount} verses` : undefined}
      >
        <QuickActions bookmarks={bookmarks} />
      </Header>

      {target && !target.ok && (
        <p role="alert" className="border-b border-border bg-surface px-4 py-3 text-[15px]">
          {target.message}
        </p>
      )}

      <DataGate>
        <FeedLoader
          target={target?.ok ? target.key : undefined}
          navigationKey={location.key}
          headerHeight={headerHeight}
          onTopSurahChange={setTopSurah}
        />
      </DataGate>
    </>
  )
}

function FeedLoader(props: Omit<Parameters<typeof QuranFeed>[0], 'feed'>) {
  const feed = useFeed()

  if (!feed) {
    return (
      <div role="status" className="flex justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-3 border-border border-t-accent" aria-hidden="true" />
        <span className="sr-only">Loading verses…</span>
      </div>
    )
  }
  return <QuranFeed feed={feed} {...props} />
}
