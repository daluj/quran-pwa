import { useLiveQuery } from 'dexie-react-hooks'
import { Search, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { DataGate } from '../../components/DataGate'
import { Header } from '../../components/layout/Header'
import { db } from '../../db/db'
import { parseReference } from '../../lib/reference'
import { ListIndex } from '../lists/ListIndex'
import { useFeed } from '../quran/useFeed'
import { SearchResults } from './SearchResults'
import { useSearch } from './useSearch'

const DEBOUNCE_MS = 150

/** Explore: search (references and full text) above the user's collections. */
export function ExplorePage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''

  // The input updates immediately; the URL (and results) follow after a pause.
  // When the URL changes from outside (back/forward, the sidebar search box),
  // the input follows it. A URL change we wrote ourselves must not: the user
  // may have typed more by the time it lands, and overwriting the input would
  // delete those words (and break the mobile keyboard's composition).
  const [text, setText] = useState(q)
  const [lastQ, setLastQ] = useState(q)
  const [pushed, setPushed] = useState<string | null>(null)
  if (q !== lastQ) {
    setLastQ(q)
    if (pushed === q) setPushed(null)
    else if (q !== text.trim()) setText(q)
  }

  useEffect(() => {
    const next = text.trim()
    if (next === q) return
    const timer = setTimeout(() => {
      setPushed(next)
      setParams(next ? { q: next } : {}, { replace: true })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, q, setParams])

  const surahs = useLiveQuery(() => db.surahs.orderBy('number').toArray(), [])
  const feed = useFeed()
  const reference = surahs ? parseReference(q, surahs) : ({ kind: 'none' } as const)
  const { query, results } = useSearch(feed, reference.kind === 'none' ? q : '')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const typed = surahs ? parseReference(text, surahs) : undefined
    if (typed?.kind === 'ok') navigate(typed.path)
    else if (text.trim() !== q) setParams(text.trim() ? { q: text.trim() } : {}, { replace: true })
  }

  return (
    <>
      <Header>
        <form role="search" onSubmit={onSubmit} className="px-4 pb-2">
          <label className="flex h-11 items-center gap-3 rounded-full border border-transparent bg-surface px-4 focus-within:border-accent focus-within:bg-bg">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <span className="sr-only">Search the Quran</span>
            <input
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search or go to 2:255"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              dir="auto"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
            />
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                aria-label="Clear search"
                className="-mr-2 rounded-full p-1 text-muted hover:bg-hover hover:text-fg"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </label>
        </form>
      </Header>

      <DataGate>
        {q ? (
          // Remount on a new query so "show more" starts from the first page.
          <SearchResults key={q} text={q} reference={reference} query={query} results={results} />
        ) : (
          <>
            <h2 className="px-4 pt-4 pb-2 text-xl font-bold">Collections</h2>
            <ListIndex type="collection" />
          </>
        )}
      </DataGate>
    </>
  )
}
