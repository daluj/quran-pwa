import { useEffect, useState } from 'react'
import { db } from '../../db/db'
import { buildFeed, type Feed } from './feed'

// The Quran text never changes while the app runs (re-seeding happens before
// the data is marked ready), so the feed is built once and shared.
let cached: Feed | undefined
let pending: Promise<Feed> | undefined

function loadFeed(): Promise<Feed> {
  pending ??= Promise.all([db.verses.orderBy('[surah+ayah]').toArray(), db.surahs.orderBy('number').toArray()])
    .then(([verses, surahs]) => (cached = buildFeed(verses, surahs)))
    .catch((error: unknown) => {
      pending = undefined
      throw error
    })
  return pending
}

/** The full Quran feed (6,236 verses + 114 headers); undefined while loading. */
export function useFeed(): Feed | undefined {
  const [feed, setFeed] = useState(cached)
  useEffect(() => {
    if (feed) return
    let cancelled = false
    void loadFeed().then((f) => !cancelled && setFeed(f))
    return () => {
      cancelled = true
    }
  }, [feed])
  return feed
}
