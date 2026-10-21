import { Bookmark, FolderPlus, HandHeart, Mic, type LucideIcon } from 'lucide-react'
import { memo } from 'react'
import type { Surah, TranslationLanguage, Verse } from '../../data/types'
import { toggleBookmark } from '../../db/bookmarks'
import type { ListType } from '../../db/db'

interface VerseCardProps {
  verse: Verse
  surah: Surah
  showArabic: boolean
  showEnglish: boolean
  language: TranslationLanguage
  /** Only the verse number and text: no title line, no actions. */
  readingMode: boolean
  isLastRead: boolean
  isLastRecited: boolean
  savedInCollection: boolean
  savedInPrayers: boolean
  highlighted: boolean
  /** Opens the save sheet; must be stable (cards are memoized). */
  onSave: (type: ListType, verseKey: string) => void
}

/** One "post" in the Quran feed. */
export const VerseCard = memo(function VerseCard({
  verse,
  surah,
  showArabic,
  showEnglish,
  language,
  readingMode,
  isLastRead,
  isLastRecited,
  savedInCollection,
  savedInPrayers,
  highlighted,
  onSave,
}: VerseCardProps) {
  return (
    <article
      aria-label={`Surah ${surah.number}, verse ${verse.ayah}`}
      className={`flex gap-3 border-b border-border px-4 pt-3 ${readingMode ? 'pb-3' : 'pb-1'} ${highlighted ? 'verse-highlight' : ''}`}
    >
      <div aria-hidden="true" className="pt-0.5">
        <span className="flex size-10 items-center justify-center rounded-full bg-surface text-sm font-semibold text-muted">
          {verse.ayah}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        {!readingMode && (
          <p aria-hidden="true" className="mb-1 text-[15px]">
            <span className="font-bold">Surah {surah.number}</span>
            <span className="text-muted"> · {verse.key}</span>
          </p>
        )}
        {showArabic && (
          <p lang="ar" className="quran-text">
            {verse.textArabic}
          </p>
        )}
        {showEnglish && (
          <p lang={language} className={`text-[15px] leading-relaxed ${showArabic ? 'mt-1' : readingMode ? 'pt-2' : ''}`}>
            {verse.translations[language]}
          </p>
        )}

        {!readingMode && (
          <div role="group" aria-label={`Actions for verse ${verse.key}`} className="-ml-2 mt-1 flex max-w-md justify-between">
            <ActionButton
              icon={FolderPlus}
              label="Save to collection"
              activeLabel="Saved in collections (edit)"
              active={savedInCollection}
              opensDialog
              onClick={() => onSave('collection', verse.key)}
            />
            <ActionButton
              icon={HandHeart}
              label="Save to prayers"
              activeLabel="Saved in prayers (edit)"
              active={savedInPrayers}
              tone="prayer"
              opensDialog
              onClick={() => onSave('prayer', verse.key)}
            />
            <ActionButton
              icon={Bookmark}
              label="Mark as last read"
              activeLabel="Last read (tap to clear)"
              active={isLastRead}
              tone="read"
              onClick={() => void toggleBookmark('lastRead', verse.key)}
            />
            <ActionButton
              icon={Mic}
              label="Mark as last recited"
              activeLabel="Last recited (tap to clear)"
              active={isLastRecited}
              tone="recite"
              onClick={() => void toggleBookmark('lastRecited', verse.key)}
            />
          </div>
        )}
      </div>
    </article>
  )
})

const TONES = {
  read: { active: 'text-read', hover: 'hover:text-read hover:bg-read/10' },
  recite: { active: 'text-recite', hover: 'hover:text-recite hover:bg-recite/10' },
  prayer: { active: 'text-prayer', hover: 'hover:text-prayer hover:bg-prayer/10' },
  neutral: { active: 'text-accent', hover: 'hover:text-accent hover:bg-accent/10' },
}

interface ActionButtonProps {
  icon: LucideIcon
  label: string
  activeLabel?: string
  active?: boolean
  disabled?: boolean
  /** Opens a sheet instead of toggling: announced as a dialog trigger, not a toggle. */
  opensDialog?: boolean
  tone?: keyof typeof TONES
  onClick?: () => void
}

function ActionButton({
  icon: Icon,
  label,
  activeLabel,
  active = false,
  disabled = false,
  opensDialog = false,
  tone = 'neutral',
  onClick,
}: ActionButtonProps) {
  const colors = TONES[tone]
  const name = active && activeLabel ? activeLabel : label

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={onClick && !opensDialog ? active : undefined}
      aria-haspopup={opensDialog ? 'dialog' : undefined}
      aria-label={disabled ? `${label} (coming soon)` : name}
      title={disabled ? `${label} (coming soon)` : name}
      className={`rounded-full p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? colors.active : 'text-muted'
      } ${disabled ? '' : colors.hover}`}
    >
      <Icon className="size-[18px]" fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  )
}
