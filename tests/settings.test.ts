import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '../src/db/db'
import { textVisibility } from '../src/db/settings'

describe('textVisibility', () => {
  const v = (showTranslation: boolean, englishOnly: boolean) =>
    textVisibility({ ...DEFAULT_SETTINGS, showTranslation, englishOnly })

  it('shows Arabic and English by default', () => {
    expect(textVisibility(DEFAULT_SETTINGS)).toEqual({ arabic: true, english: true })
  })

  it('shows only the Arabic with the translation off', () => {
    expect(v(false, false)).toEqual({ arabic: true, english: false })
  })

  it('shows only the English with English only on, whatever the translation switch says', () => {
    expect(v(true, true)).toEqual({ arabic: false, english: true })
    expect(v(false, true)).toEqual({ arabic: false, english: true })
  })
})
