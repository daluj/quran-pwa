// @vitest-environment jsdom
import { cleanup, render, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { Surah, Verse } from '../src/data/types'
import { VerseCard } from '../src/features/quran/VerseCard'

const verses = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'verses.json'), 'utf8')) as Verse[]
const surah = { number: 37 } as Surah

afterEach(cleanup)

function renderCard(key: string) {
  const verse = verses.find((v) => v.key === key)!
  render(
    <VerseCard
      verse={verse}
      surah={surah}
      showArabic
      showEnglish={false}
      language="en"
      readingMode
      isLastRead={false}
      isLastRecited={false}
      savedInCollection={false}
      savedInPrayers={false}
      highlighted={false}
      onSave={() => {}}
    />,
  )
  return { verse, arabic: document.querySelector('p[lang="ar"]')! }
}

describe('VerseCard word audio', () => {
  it('makes each word a button named by the word', () => {
    const { verse, arabic } = renderCard('37:129')
    const buttons = within(arabic as HTMLElement).getAllByRole('button')
    expect(buttons.map((b) => b.textContent)).toEqual(verse.textArabic.split(' '))
  })

  it('keeps the displayed verse text identical when copied', () => {
    const { verse, arabic } = renderCard('37:129')
    expect(arabic.textContent).toBe(verse.textArabic)
  })

  it('shows a verse from the exceptions list as plain text', () => {
    const { verse, arabic } = renderCard('37:130')
    expect(within(arabic as HTMLElement).queryAllByRole('button')).toHaveLength(0)
    expect(arabic.textContent).toBe(verse.textArabic)
  })
})
