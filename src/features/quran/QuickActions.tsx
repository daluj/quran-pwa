import { Bookmark, Mic, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import type { Surah } from '../../data/types'
import type { BookmarkKeys } from '../../db/bookmarks'

interface QuickActionsProps {
  bookmarks: BookmarkKeys
  surahs: Surah[] | undefined
}

/** "Continue reading" / "Continue reciting" pills, jumping to the bookmarks. */
export function QuickActions({ bookmarks, surahs }: QuickActionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-2">
      <Pill icon={Bookmark} label="Continue reading" verseKey={bookmarks.lastRead} surahs={surahs} tone="read" />
      <Pill icon={Mic} label="Continue reciting" verseKey={bookmarks.lastRecited} surahs={surahs} tone="recite" />
    </div>
  )
}

interface PillProps {
  icon: LucideIcon
  label: string
  verseKey: string | undefined
  surahs: Surah[] | undefined
  tone: 'read' | 'recite'
}

function Pill({ icon: Icon, label, verseKey, surahs, tone }: PillProps) {
  const navigate = useNavigate()
  const [surah, ayah] = verseKey?.split(':') ?? []
  const name = surahs?.find((s) => String(s.number) === surah)?.name
  const where = verseKey ? `${name ?? `Surah ${surah}`} ${ayah}` : 'no bookmark yet'

  return (
    <button
      type="button"
      disabled={!verseKey}
      onClick={() => navigate(`/quran/${surah}/${ayah}`)}
      aria-label={verseKey ? `${label}: ${name ?? 'surah ' + surah}, verse ${ayah}` : `${label}: no bookmark yet`}
      className="flex shrink-0 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-hover disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
    >
      <Icon className={`size-4 ${tone === 'read' ? 'text-read' : 'text-recite'}`} fill="currentColor" aria-hidden="true" />
      <span className="font-bold">{label}</span>
      <span className="text-muted">{where}</span>
    </button>
  )
}
