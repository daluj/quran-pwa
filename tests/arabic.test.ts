import { describe, expect, it } from 'vitest'
import { normalizeArabic, stripDiacritics } from '../src/lib/arabic.ts'

describe('stripDiacritics', () => {
  it('removes harakat, shadda, superscript alef and Quranic marks', () => {
    expect(stripDiacritics('ٱلرَّحْمَٰنِ')).toBe('ٱلرحمن')
    expect(stripDiacritics('وَرَسُولِهِۦٓ')).toBe('ورسوله')
    expect(stripDiacritics('۞ وَ')).toBe(' و')
  })
})

describe('normalizeArabic', () => {
  it('unifies alif forms', () => {
    expect(normalizeArabic('أ إ آ ٱ ا')).toBe('ا ا ا ا ا')
  })

  it('unifies ta marbuta and alif maqsura', () => {
    expect(normalizeArabic('رَحْمَةٌ')).toBe('رحمه')
    expect(normalizeArabic('ٱلَّذِى')).toBe('الذي')
  })

  it('collapses whitespace', () => {
    expect(normalizeArabic('  بِسْمِ   ٱللَّهِ ')).toBe('بسم الله')
  })
})
