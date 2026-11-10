import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getCheckedIds, localDateKey, msUntilMidnight, setChecked } from '../src/db/dailyChecks'
import { QuranDB } from '../src/db/db'

let db: QuranDB
let n = 0

beforeEach(() => {
  db = new QuranDB(`daily-${n++}`)
})

afterEach(async () => {
  await db.delete()
})

describe('localDateKey', () => {
  it('uses the local date and changes at local midnight', () => {
    expect(localDateKey(new Date(2026, 10, 9, 23, 59))).toBe('2026-11-09')
    expect(localDateKey(new Date(2026, 10, 10, 0, 1))).toBe('2026-11-10')
    expect(localDateKey(new Date(2026, 0, 5, 12))).toBe('2026-01-05')
  })

  it('counts the time left until midnight', () => {
    expect(msUntilMidnight(new Date(2026, 10, 9, 23, 59))).toBe(60_000)
  })
})

describe('daily checks', () => {
  it('stores today\'s date when ticked and removes the row when unticked', async () => {
    await setChecked('fajr', true, '2026-11-10', db)
    expect(await db.dailyChecks.get('fajr')).toEqual({ itemId: 'fajr', date: '2026-11-10' })
    await setChecked('fajr', false, '2026-11-10', db)
    expect(await db.dailyChecks.get('fajr')).toBeUndefined()
  })

  it('ignores rows from earlier days', async () => {
    await setChecked('fajr', true, '2026-11-09', db)
    expect(await getCheckedIds('2026-11-10', db)).toEqual([])
    expect(await getCheckedIds('2026-11-09', db)).toEqual(['fajr'])
  })

  it('overwrites yesterday when ticked again today', async () => {
    await setChecked('fajr', true, '2026-11-09', db)
    await setChecked('fajr', true, '2026-11-10', db)
    expect(await getCheckedIds('2026-11-10', db)).toEqual(['fajr'])
    expect(await db.dailyChecks.count()).toBe(1)
  })

  it('ticking one item leaves the others alone', async () => {
    await setChecked('fajr', true, '2026-11-10', db)
    await setChecked('isha', true, '2026-11-10', db)
    await setChecked('fajr', false, '2026-11-10', db)
    expect(await getCheckedIds('2026-11-10', db)).toEqual(['isha'])
  })
})

describe('schema upgrade', () => {
  it('opens a version 2 database as version 3 and keeps its data', async () => {
    const name = `daily-upgrade-${n++}`
    const { default: Dexie } = await import('dexie')
    const old = new Dexie(name)
    old.version(1).stores({
      verses: '&key, surah, [surah+ayah]',
      surahs: '&number',
      lists: '&id, type, name',
      listItems: '&id, listId, verseKey, [listId+position], [listId+verseKey]',
      bookmarks: '&type',
      settings: '&key',
      meta: '&key',
    })
    old.version(2).stores({ wordAudioDownloads: '&surah' })
    await old.open()
    await old.table('bookmarks').put({ type: 'lastRead', verseKey: '2:255', updatedAt: 1 })
    old.close()

    const upgraded = new QuranDB(name)
    expect(await upgraded.bookmarks.count()).toBe(1)
    expect(await upgraded.dailyChecks.count()).toBe(0)
    await upgraded.delete()
  })
})
