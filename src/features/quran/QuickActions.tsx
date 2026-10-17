import { Bookmark, Mic, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import type { BookmarkKeys } from '../../db/bookmarks'

interface QuickActionsProps {
  bookmarks: BookmarkKeys
}

/** "Continue reading" / "Continue reciting" pills, jumping to the bookmarks. */
export function QuickActions({ bookmarks }: QuickActionsProps) {
  return (
    <div className="flex gap-2 px-4 pb-2">
      <Pill icon={Bookmark} label="Continue reading" short="Reading" verseKey={bookmarks.lastRead} tone="read" />
      <Pill icon={Mic} label="Continue reciting" short="Reciting" verseKey={bookmarks.lastRecited} tone="recite" />
    </div>
  )
}

interface PillProps {
  icon: LucideIcon
  label: string
  /** Label on narrow screens, where both pills must fit on one line. */
  short: string
  verseKey: string | undefined
  tone: 'read' | 'recite'
}

function Pill({ icon: Icon, label, short, verseKey, tone }: PillProps) {
  const navigate = useNavigate()
  const [surah, ayah] = verseKey?.split(':') ?? []

  return (
    <button
      type="button"
      disabled={!verseKey}
      onClick={() => navigate(`/quran/${surah}/${ayah}`)}
      title={verseKey ? `${label}: surah ${surah}, verse ${ayah}` : `${label}: no bookmark yet`}
      className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full sm:flex-none border border-border px-3 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-hover disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
    >
      <Icon className={`size-4 ${tone === 'read' ? 'text-read' : 'text-recite'}`} fill="currentColor" aria-hidden="true" />
      {/* The visible text is the accessible name (no aria-label), so voice control matches it. */}
      <span className="font-bold">
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
      <span className="truncate text-muted">{verseKey ?? 'not set'}</span>
    </button>
  )
}
