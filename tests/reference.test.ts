import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Surah } from '../src/data/types'
import { parseReference } from '../src/lib/reference'

const surahs = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'surahs.json'), 'utf8'),
) as Surah[]

describe('parseReference', () => {
  it.each([
    ['25:43', 25, 43],
    ['25 43', 25, 43],
    ['  25  :  43 ', 25, 43],
    ['25.43', 25, 43],
    ['25/43', 25, 43],
    ['25-43', 25, 43],
    ['٢:٢٥٥', 2, 255],
    ['۲:۲۵۵', 2, 255],
  ])('reads %j as %i:%i', (input, surah, ayah) => {
    expect(parseReference(input, surahs)).toEqual({
      kind: 'ok',
      surah,
      ayah,
      label: `${surah}:${ayah}`,
      path: `/quran/${surah}/${ayah}`,
    })
  })

  it.each(['25', '25:', '25 '])('reads %j as a whole surah', (input) => {
    expect(parseReference(input, surahs)).toEqual({
      kind: 'ok',
      surah: 25,
      ayah: undefined,
      label: 'Surah 25',
      path: '/quran/25/1',
    })
  })

  it('explains references that do not exist', () => {
    expect(parseReference('115', surahs)).toMatchObject({ kind: 'error', message: /no surah 115/ })
    expect(parseReference('0', surahs)).toMatchObject({ kind: 'error' })
    expect(parseReference('1:8', surahs)).toMatchObject({ kind: 'error', message: /Surah 1 has 7 verses/ })
    expect(parseReference('2:0', surahs)).toMatchObject({ kind: 'error' })
  })

  it('leaves text searches alone', () => {
    for (const input of ['mercy', 'رحمة', '2 mercy', 'verse 255', '', '  ', '1:2:3']) {
      expect(parseReference(input, surahs), input).toEqual({ kind: 'none' })
    }
  })
})
