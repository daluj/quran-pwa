import { useLiveQuery } from 'dexie-react-hooks'
import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { db } from '../../db/db'

/** Optional desktop column: search box and a surah list. */
export function RightColumn() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const surahs = useLiveQuery(() => db.surahs.orderBy('number').toArray(), [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore')
  }

  return (
    <aside aria-label="Sidebar" className="hidden w-[350px] shrink-0 pl-8 lg:block">
      <div className="sticky top-0 flex max-h-dvh flex-col gap-4 py-2">
        <form role="search" onSubmit={onSubmit}>
          <label className="flex h-11 items-center gap-3 rounded-full border border-transparent bg-surface px-4 focus-within:border-accent focus-within:bg-bg">
            <Search className="size-4 text-muted" aria-hidden="true" />
            <span className="sr-only">Search the Quran</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or go to 2:255"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
            />
          </label>
        </form>

        <section aria-labelledby="surahs-heading" className="flex min-h-0 flex-col rounded-2xl border border-border">
          <h2 id="surahs-heading" className="px-4 pt-3 pb-2 text-xl font-bold">
            Surahs
          </h2>
          <ul className="min-h-0 overflow-y-auto pb-2">
            {surahs?.map((s) => (
              <li key={s.number}>
                <Link
                  to={`/quran/${s.number}/1`}
                  className="flex items-baseline justify-between px-4 py-2 transition-colors hover:bg-hover"
                >
                  <span className="font-semibold">Surah {s.number}</span>
                  <span className="shrink-0 text-sm text-muted">{s.verseCount} verses</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  )
}
