import { ArrowRight } from 'lucide-react'
import { memo, useState } from 'react'
import { Link } from 'react-router'
import { Highlighted } from '../../components/Highlighted'
import type { Verse } from '../../data/types'
import { useSettings, useTextVisibility } from '../../db/settings'
import type { ReferenceResult } from '../../lib/reference'
import { highlightRanges, MIN_QUERY_LENGTH, type SearchQuery } from '../../lib/search'

const PAGE_SIZE = 30

interface SearchResultsProps {
  text: string
  reference: ReferenceResult
  query: SearchQuery | null
  results: Verse[]
}

/** "Go to" row for references, then matching verses with the match highlighted. */
export function SearchResults({ text, reference, query, results }: SearchResultsProps) {
  const [shown, setShown] = useState(PAGE_SIZE)

  return (
    <div>
      {reference.kind === 'ok' && (
        <Link
          to={reference.path}
          className="flex items-center gap-4 border-b border-border px-4 py-4 transition-colors hover:bg-hover"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-fg">
            <ArrowRight className="size-5" aria-hidden="true" />
          </span>
          <span className="font-bold">Go to {reference.label}</span>
        </Link>
      )}
      {reference.kind === 'error' && (
        <p role="status" className="border-b border-border px-4 py-4 text-[15px]">
          {reference.message}
        </p>
      )}

      {reference.kind === 'none' && !query && (
        <p className="px-4 py-8 text-center text-muted">Type at least {MIN_QUERY_LENGTH} characters to search.</p>
      )}

      {query && (
        <>
          <p role="status" className="border-b border-border px-4 py-3 text-sm text-muted">
            {results.length === 0
              ? `No verses match “${text.trim()}”.`
              : `${results.length.toLocaleString('en')} ${results.length === 1 ? 'verse matches' : 'verses match'} “${text.trim()}”` +
                (query.script === 'arabic' ? ' in the Arabic.' : ' in the translation.')}
          </p>
          <ol aria-label="Search results">
            {results.slice(0, shown).map((verse) => (
              <li key={verse.key}>
                <ResultCard verse={verse} query={query} />
              </li>
            ))}
          </ol>
          {results.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_SIZE)}
              className="w-full px-4 py-4 text-center font-bold text-accent transition-colors hover:bg-hover"
            >
              Show more results ({(results.length - shown).toLocaleString('en')} left)
            </button>
          )}
        </>
      )}
    </div>
  )
}

const ResultCard = memo(function ResultCard({ verse, query }: { verse: Verse; query: SearchQuery }) {
  const { arabicFontSize, translationLanguage } = useSettings()
  const translation = verse.translations[translationLanguage]
  const visible = useTextVisibility()
  const arabic = query.script === 'arabic'

  return (
    // The "Surah N · s:a" line is the link; its ::after covers the whole card
    // so the card is clickable while the link's name stays short.
    <article className="relative border-b border-border px-4 py-3 transition-colors hover:bg-hover">
      <p className="text-[15px]">
        <Link to={`/quran/${verse.surah}/${verse.ayah}`} className="after:absolute after:inset-0">
          <span className="font-bold">Surah {verse.surah}</span>
          <span className="text-muted"> · {verse.key}</span>
        </Link>
      </p>
      {/* The text that matched is always shown, whatever the reading settings. */}
      {(visible.arabic || arabic) && (
        <p
          lang="ar"
          className="quran-text mt-1"
          style={{ ['--arabic-font-size' as string]: `${arabicFontSize}px` }}
        >
          {arabic ? (
            <Highlighted text={verse.textArabic} ranges={highlightRanges(verse.textArabic, query)} />
          ) : (
            verse.textArabic
          )}
        </p>
      )}
      {(visible.english || !arabic) && (
        <p lang={translationLanguage} className="mt-1 text-[15px] leading-relaxed">
          {arabic ? (
            translation
          ) : (
            <Highlighted text={translation} ranges={highlightRanges(translation, query)} />
          )}
        </p>
      )}
    </article>
  )
})
