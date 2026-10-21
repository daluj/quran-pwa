import 'fake-indexeddb/auto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { QuranMeta, Surah, Verse } from '../src/data/types'
import { QuranDB } from '../src/db/db'
import { getSettings, setSetting } from '../src/db/settings'
import {
  DATA_VERSION_KEY,
  DEFAULT_LISTS,
  DEFAULT_LISTS_KEY,
  LEGACY_DEFAULT_TOPICS_KEY,
  seedDefaultLists,
  seedQuranData,
  type QuranSource,
} from '../src/db/seed'

const dataDir = join(import.meta.dirname, '..', 'src', 'data')
const read = <T>(name: string) => JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as T
const meta = read<QuranMeta>('meta.json')
const surahs = read<Surah[]>('surahs.json')
const verses = read<Verse[]>('verses.json')

let db: QuranDB
let n = 0

function source(overrides: Partial<QuranSource> = {}): QuranSource {
  return { meta, surahs, loadVerses: vi.fn(async () => verses), ...overrides }
}

beforeEach(() => {
  db = new QuranDB(`test-${n++}`)
})

afterEach(async () => {
  await db.delete()
})

describe('seedQuranData', () => {
  it('loads all verses and surahs on first launch', async () => {
    expect(await seedQuranData(db, source())).toBe('seeded')
    expect(await db.verses.count()).toBe(6236)
    expect(await db.surahs.count()).toBe(114)
    expect(await db.verses.get('2:255')).toMatchObject({ surah: 2, ayah: 255 })
    expect(await db.verses.where('surah').equals(1).count()).toBe(7)
    expect((await db.meta.get(DATA_VERSION_KEY))?.value).toBe(meta.version)
  })

  it('does not reload when the version is unchanged', async () => {
    await seedQuranData(db, source())
    const second = source()
    expect(await seedQuranData(db, second)).toBe('up-to-date')
    expect(second.loadVerses).not.toHaveBeenCalled()
  })

  it('re-seeds when the data version changes, keeping user data', async () => {
    await seedQuranData(db, source())
    await seedDefaultLists(db)
    await db.bookmarks.put({ type: 'lastRead', verseKey: '2:255', updatedAt: 1 })

    const changed = verses.map((v) => (v.key === '1:1' ? { ...v, translations: { ...v.translations, en: 'updated' } } : v))
    const result = await seedQuranData(
      db,
      source({ meta: { ...meta, version: 'newversion00' }, loadVerses: async () => changed }),
    )

    expect(result).toBe('seeded')
    expect((await db.verses.get('1:1'))?.translations.en).toBe('updated')
    expect(await db.verses.count()).toBe(6236)
    expect(await db.lists.count()).toBe(DEFAULT_LISTS.length)
    expect(await db.bookmarks.get('lastRead')).toBeDefined()
  })

  it('rejects incomplete data and leaves the database empty', async () => {
    await expect(seedQuranData(db, source({ loadVerses: async () => verses.slice(0, 10) }))).rejects.toThrow(
      /incomplete/,
    )
    expect(await db.verses.count()).toBe(0)
  })
})

describe('default lists', () => {
  const verseKeys = new Set(verses.map((v) => v.key))

  it('only uses verses that exist, once per list, with unique names per type', () => {
    for (const list of DEFAULT_LISTS) {
      expect(['prayer', 'collection'], list.name).toContain(list.type)
      expect(list.verses.filter((k) => !verseKeys.has(k)), list.name).toEqual([])
      expect(new Set(list.verses).size, list.name).toBe(list.verses.length)
    }
    for (const type of ['prayer', 'collection']) {
      const names = DEFAULT_LISTS.filter((l) => l.type === type).map((l) => l.name.toLowerCase())
      expect(new Set(names).size).toBe(names.length)
    }
  })

  it('creates every default list with its verses, in order', async () => {
    expect(await seedDefaultLists(db)).toBe(true)
    const lists = (await db.lists.toArray()).sort((a, b) => a.createdAt - b.createdAt)
    expect(lists.map((l) => [l.type, l.name])).toEqual(DEFAULT_LISTS.map((l) => [l.type, l.name]))
    expect(lists.every((l) => l.isDefault)).toBe(true)

    for (const [i, list] of lists.entries()) {
      const items = await db.listItems.where('[listId+position]').between([list.id, -Infinity], [list.id, Infinity]).toArray()
      expect(items.map((it) => it.verseKey), list.name).toEqual(DEFAULT_LISTS[i]!.verses)
    }
    expect(await db.listItems.count()).toBe(DEFAULT_LISTS.reduce((n, l) => n + l.verses.length, 0))
  })

  it('does not recreate lists the user deleted', async () => {
    await seedDefaultLists(db)
    await db.lists.clear()
    await db.listItems.clear()
    expect(await seedDefaultLists(db)).toBe(false)
    expect(await db.lists.count()).toBe(0)
    expect((await db.meta.get(DEFAULT_LISTS_KEY))?.value).toBeDefined()
  })

  it('leaves installs that got the older default topics alone', async () => {
    await db.meta.put({ key: LEGACY_DEFAULT_TOPICS_KEY, value: '1' })
    expect(await seedDefaultLists(db)).toBe(false)
    expect(await db.lists.count()).toBe(0)
  })
})

describe('settings', () => {
  it('falls back to defaults and stores overrides', async () => {
    const { db: appDb } = await import('../src/db/db')
    expect((await getSettings()).theme).toBe('system')
    await setSetting('theme', 'dark')
    expect((await getSettings()).theme).toBe('dark')
    await appDb.delete()
  })
})
