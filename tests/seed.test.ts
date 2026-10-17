import 'fake-indexeddb/auto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { QuranMeta, Surah, Verse } from '../src/data/types'
import { QuranDB } from '../src/db/db'
import { getSettings, setSetting } from '../src/db/settings'
import {
  DATA_VERSION_KEY,
  DEFAULT_PRAYER_TOPICS,
  seedDefaultTopics,
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
    await seedDefaultTopics(db)
    await db.bookmarks.put({ type: 'lastRead', verseKey: '2:255', updatedAt: 1 })

    const changed = verses.map((v) => (v.key === '1:1' ? { ...v, translation: 'updated' } : v))
    const result = await seedQuranData(
      db,
      source({ meta: { ...meta, version: 'newversion00' }, loadVerses: async () => changed }),
    )

    expect(result).toBe('seeded')
    expect((await db.verses.get('1:1'))?.translation).toBe('updated')
    expect(await db.verses.count()).toBe(6236)
    expect(await db.lists.count()).toBe(DEFAULT_PRAYER_TOPICS.length)
    expect(await db.bookmarks.get('lastRead')).toBeDefined()
  })

  it('rejects incomplete data and leaves the database empty', async () => {
    await expect(seedQuranData(db, source({ loadVerses: async () => verses.slice(0, 10) }))).rejects.toThrow(
      /incomplete/,
    )
    expect(await db.verses.count()).toBe(0)
  })
})

describe('seedDefaultTopics', () => {
  it('creates the six default prayer topics in order', async () => {
    expect(await seedDefaultTopics(db)).toBe(true)
    const lists = await db.lists.orderBy('name').toArray()
    expect(lists.every((l) => l.type === 'prayer' && l.isDefault)).toBe(true)
    const byCreation = (await db.lists.toArray()).sort((a, b) => a.createdAt - b.createdAt).map((l) => l.name)
    expect(byCreation).toEqual(DEFAULT_PRAYER_TOPICS)
  })

  it('does not recreate topics the user deleted', async () => {
    await seedDefaultTopics(db)
    await db.lists.clear()
    expect(await seedDefaultTopics(db)).toBe(false)
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
