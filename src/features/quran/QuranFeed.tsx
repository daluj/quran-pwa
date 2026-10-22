import { useWindowVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import meta from '../../data/meta.json'
import type { Surah, TranslationLanguage } from '../../data/types'
import { useBookmarks } from '../../db/bookmarks'
import type { ListType } from '../../db/db'
import { useSavedVerseKeys } from '../../db/listHooks'
import { useSettings, useTextVisibility } from '../../db/settings'
import { SaveSheet, type SaveTarget } from '../lists/SaveSheet'
import { scrollRowFor, type Feed, type FeedRow } from './feed'
import { SurahHeader } from './SurahHeader'
import { VerseCard } from './VerseCard'
import { WordAudioNotice } from './WordAudioNotice'

const HIGHLIGHT_MS = 2600

// Scroll position and measured row sizes, kept across tab switches so the feed
// reopens where the user left it.
let savedPosition: { offset: number; snapshot: VirtualItem[] } | undefined

interface QuranFeedProps {
  feed: Feed
  /** Verse to scroll to and highlight ("2:255"). */
  target: string | undefined
  /** Changes on every navigation, so re-opening the same link scrolls again. */
  navigationKey: string
  /** Height of the sticky header, kept clear when scrolling to a verse. */
  headerHeight: number
  onTopSurahChange: (surah: Surah) => void
}

export function QuranFeed({ feed, target, navigationKey, headerHeight, onTopSurahChange }: QuranFeedProps) {
  const { arabicFontSize, readingMode, translationLanguage } = useSettings()
  const { arabic: showArabic, english: showEnglish } = useTextVisibility()
  const bookmarks = useBookmarks()
  const saved = useSavedVerseKeys()
  const [saveTarget, setSaveTarget] = useState<SaveTarget | null>(null)
  const openSaveSheet = useCallback((type: ListType, verseKey: string) => setSaveTarget({ type, verseKey }), [])
  // The target is highlighted until its timer marks this navigation as done.
  const [highlightDoneFor, setHighlightDoneFor] = useState<string>()
  const highlightKey = target && highlightDoneFor !== navigationKey ? target : undefined

  const listRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [scrollMargin, setScrollMargin] = useState(0)
  // Restore only when not opening a specific verse; read once on mount.
  const [restore] = useState(() => (target ? undefined : savedPosition))

  // The list starts below the sticky header (and any banner): track its
  // document offset and width for the virtualizer and size estimates. The
  // main column resizes when the window, the header or a banner does.
  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    const measure = () => {
      setWidth(el.clientWidth)
      setScrollMargin(Math.round(el.getBoundingClientRect().top + window.scrollY))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el.parentElement ?? el)
    measure()
    return () => observer.disconnect()
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: feed.rows.length,
    estimateSize: (i) => estimateRowHeight(feed.rows[i]!, width, arabicFontSize, showArabic, showEnglish, readingMode, translationLanguage),
    getItemKey: (i) => rowKey(feed.rows[i]!),
    overscan: 6,
    scrollMargin,
    scrollPaddingStart: headerHeight,
    initialMeasurementsCache: restore?.snapshot,
    initialOffset: restore?.offset,
  })

  // Top row once scrolling settles. Read when the layout changes: by then the
  // virtualizer has already re-measured the visible rows and shifted the
  // scroll position, so the current top row would be off.
  const anchorRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        anchorRef.current = topRowIndex(virtualizer.getVirtualItems(), virtualizer.scrollOffset, headerHeight)
      }, 150)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [virtualizer, headerHeight])

  // Row heights depend on the column width, font size and visible texts: when
  // any of them changes, drop the measured sizes and keep the top row in place.
  const layout = useRef({ width, arabicFontSize, showArabic, showEnglish, readingMode, translationLanguage })
  useEffect(() => {
    const prev = layout.current
    layout.current = { width, arabicFontSize, showArabic, showEnglish, readingMode, translationLanguage }
    // The first width measurement isn't a change (and must keep a restored cache).
    if (prev.width === 0) return
    if (
      prev.width === width &&
      prev.arabicFontSize === arabicFontSize &&
      prev.showArabic === showArabic &&
      prev.showEnglish === showEnglish &&
      prev.readingMode === readingMode &&
      prev.translationLanguage === translationLanguage
    ) {
      return
    }
    const anchor =
      anchorRef.current ?? topRowIndex(virtualizer.getVirtualItems(), virtualizer.scrollOffset, headerHeight)
    virtualizer.measure()
    if (anchor !== undefined && anchor > 0) virtualizer.scrollToIndex(anchor, { align: 'start' })
  }, [width, arabicFontSize, showArabic, showEnglish, readingMode, translationLanguage, headerHeight, virtualizer])

  // Restore the previous position (or start at the top) when the feed opens.
  useLayoutEffect(() => {
    if (target) return
    window.scrollTo(0, restore?.offset ?? 0)
    // Mount only: later navigations without a target keep the current position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Remember the position when leaving the Quran section. scrollOffset still
  // holds the last scroll position here; the next page hasn't scrolled yet.
  useEffect(
    () => () => {
      savedPosition = { offset: virtualizer.scrollOffset ?? 0, snapshot: virtualizer.takeSnapshot() }
    },
    [virtualizer],
  )

  // Deep link: scroll to the verse and highlight it briefly.
  useEffect(() => {
    if (!target) return
    const index = scrollRowFor(feed, target)
    if (index === undefined) return
    virtualizer.scrollToIndex(index, { align: 'start' })
    const timer = setTimeout(() => setHighlightDoneFor(navigationKey), HIGHLIGHT_MS)
    return () => clearTimeout(timer)
  }, [feed, target, navigationKey, virtualizer])

  const items = virtualizer.getVirtualItems()

  // Surah of the first row visible under the header, shown in the header title.
  const topIndex = topRowIndex(items, virtualizer.scrollOffset, headerHeight) ?? 0
  const topSurah = feed.rows[topIndex]!.surah
  useEffect(() => onTopSurahChange(topSurah), [topSurah, onTopSurahChange])

  return (
    <>
      <div
        ref={listRef}
        aria-label="Quran"
        style={
          {
            height: virtualizer.getTotalSize(),
            position: 'relative',
            '--arabic-font-size': `${arabicFontSize}px`,
          } as CSSProperties
        }
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${(items[0]?.start ?? 0) - virtualizer.options.scrollMargin}px)`,
          }}
        >
          {items.map((item) => {
            const row = feed.rows[item.index]!
            return (
              <div key={item.key} data-index={item.index} ref={virtualizer.measureElement}>
                {row.kind === 'surah' ? (
                  <SurahHeader surah={row.surah} bismillah={showArabic ? meta.bismillah : undefined} />
                ) : (
                  <VerseCard
                    verse={row.verse}
                    surah={row.surah}
                    showArabic={showArabic}
                    showEnglish={showEnglish}
                    language={translationLanguage}
                    readingMode={readingMode}
                    isLastRead={bookmarks.lastRead === row.verse.key}
                    isLastRecited={bookmarks.lastRecited === row.verse.key}
                    savedInCollection={saved.collection.has(row.verse.key)}
                    savedInPrayers={saved.prayer.has(row.verse.key)}
                    highlighted={highlightKey === row.verse.key}
                    onSave={openSaveSheet}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
      <SaveSheet target={saveTarget} onClose={() => setSaveTarget(null)} />
      <WordAudioNotice />
    </>
  )
}

/** Index of the first row visible below the sticky header. */
function topRowIndex(items: VirtualItem[], scrollOffset: number | null, headerHeight: number): number | undefined {
  // 1px tolerance: a row whose bottom edge sits on the header line is above it.
  const visibleTop = (scrollOffset ?? 0) + headerHeight + 1
  return (items.find((item) => item.end > visibleTop) ?? items[0])?.index
}

function rowKey(row: FeedRow): string {
  return row.kind === 'surah' ? `s${row.surah.number}` : row.verse.key
}

/**
 * Rough row height before measuring. Good estimates keep the scrollbar steady
 * and make deep-link jumps land close to the target before rows are measured.
 */
function estimateRowHeight(
  row: FeedRow,
  width: number,
  fontSize: number,
  showArabic: boolean,
  showEnglish: boolean,
  readingMode: boolean,
  language: TranslationLanguage,
): number {
  const lineHeight = fontSize * 2.2
  if (row.kind === 'surah') {
    return 150 + (row.surah.bismillah && showArabic ? lineHeight + 12 : 0)
  }
  // Card padding (32) and the verse-number column (52). Before the first
  // measurement the width is 0; assume the desktop column.
  const textWidth = Math.max((width || 600) - 84, 160)
  const arabicLines = showArabic
    ? Math.max(1, Math.ceil((row.verse.textArabicPlain.length * fontSize * 0.42) / textWidth))
    : 0
  const translationLines = showEnglish ? Math.ceil((row.verse.translations[language].length * 7.6) / textWidth) : 0
  const text = arabicLines * lineHeight + translationLines * 24.4 + (showArabic && showEnglish ? 4 : 0)
  // Reading mode: padding, at least as tall as the number circle (42) plus the
  // last-read button (34). Otherwise also the title line and the action bar.
  return readingMode ? Math.max(12 + text + 12, 12 + 42 + 34 + 12) + 1 : 12 + 22 + 4 + text + 4 + 42 + 1
}
