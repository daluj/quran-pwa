import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  getWeekTicks,
  localDateKey,
  msUntilMidnight,
  pruneOldWeeks,
  setChecked,
  weekDateKeys,
  weekStartKey,
} from '../src/db/dailyTicks'
import { QuranDB } from '../src/db/db'
import { DAILY_ITEMS } from '../src/features/daily/items'
import { buildWeek } from '../src/features/daily/week'

let db: QuranDB
let n = 0

beforeEach(() => {
  db = new QuranDB(`daily-${n++}`)
})

afterEach(async () => {
  await db.delete()
})

describe('dates', () => {
  it('uses the local date and changes at local midnight', () => {
    expect(localDateKey(new Date(2026, 10, 9, 23, 59))).toBe('2026-11-09')
    expect(localDateKey(new Date(2026, 10, 10, 0, 1))).toBe('2026-11-10')
    expect(localDateKey(new Date(2026, 0, 5, 12))).toBe('2026-01-05')
  })

  it('counts the time left until midnight', () => {
    expect(msUntilMidnight(new Date(2026, 10, 9, 23, 59))).toBe(60_000)
  })

  it('starts the week on the Sunday on or before the date', () => {
    expect(weekStartKey('2026-11-08')).toBe('2026-11-08') // Sunday
    expect(weekStartKey('2026-11-12')).toBe('2026-11-08') // Thursday
    expect(weekStartKey('2026-11-14')).toBe('2026-11-08') // Saturday
    expect(weekStartKey('2026-11-15')).toBe('2026-11-15') // next Sunday
  })

  it('finds the week start across month and year boundaries', () => {
    expect(weekStartKey('2026-01-02')).toBe('2025-12-28')
    expect(weekStartKey('2026-03-01')).toBe('2026-03-01')
    expect(weekStartKey('2026-03-03')).toBe('2026-03-01')
  })

  it('lists seven consecutive dates starting on Sunday', () => {
    expect(weekDateKeys('2026-12-30')).toEqual([
      '2026-12-27',
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ])
  })
})

describe('daily ticks', () => {
  it('stores one row per item per day and unticks only today', async () => {
    await setChecked('fajr', true, '2026-11-09', db)
    await setChecked('fajr', true, '2026-11-10', db)
    await setChecked('isha', true, '2026-11-10', db)
    await setChecked('fajr', false, '2026-11-10', db)
    expect(await db.dailyTicks.toArray()).toEqual(
      expect.arrayContaining([
        { date: '2026-11-09', itemId: 'fajr' },
        { date: '2026-11-10', itemId: 'isha' },
      ]),
    )
    expect(await db.dailyTicks.count()).toBe(2)
  })

  it('ticking twice does not duplicate', async () => {
    await setChecked('fajr', true, '2026-11-10', db)
    await setChecked('fajr', true, '2026-11-10', db)
    expect(await db.dailyTicks.count()).toBe(1)
  })

  it('reads only the ticks of the week of the given day', async () => {
    await setChecked('fajr', true, '2026-11-07', db) // Saturday before
    await setChecked('fajr', true, '2026-11-08', db) // Sunday
    await setChecked('fajr', true, '2026-11-14', db) // Saturday
    await setChecked('fajr', true, '2026-11-15', db) // next Sunday
    const ticks = await getWeekTicks('2026-11-10', db)
    expect(ticks.map((t) => t.date).sort()).toEqual(['2026-11-08', '2026-11-14'])
  })

  it('prunes rows before this week only', async () => {
    await setChecked('fajr', true, '2026-11-07', db)
    await setChecked('fajr', true, '2026-11-08', db)
    await setChecked('isha', true, '2026-11-14', db)
    await pruneOldWeeks('2026-11-10', db)
    expect((await db.dailyTicks.toArray()).map((t) => t.date).sort()).toEqual(['2026-11-08', '2026-11-14'])
    // On the next Sunday last Saturday's row goes.
    await pruneOldWeeks('2026-11-15', db)
    expect(await db.dailyTicks.count()).toBe(0)
  })
})

describe('week grid model', () => {
  const ticks = [
    { date: '2026-11-08', itemId: 'fajr' },
    { date: '2026-11-09', itemId: 'fajr' },
    { date: '2026-11-11', itemId: 'fajr' },
    { date: '2026-11-11', itemId: 'isha' },
  ]

  it('marks past days missed, future days upcoming, and counts up to today', () => {
    const week = buildWeek(DAILY_ITEMS, ticks, '2026-11-11') // Wednesday
    const fajr = week.rows.find((r) => r.item.id === 'fajr')!
    expect(fajr.cells).toEqual(['done', 'done', 'missed', 'done', 'upcoming', 'upcoming', 'upcoming'])
    expect(fajr.done).toBe(3)
    expect(week.todayIndex).toBe(3)
    expect(week.daysSoFar).toBe(4)
    expect(week.possible).toBe(20)
    expect(week.done).toBe(4)
  })

  it('is out of 35 on Saturday', () => {
    expect(buildWeek(DAILY_ITEMS, [], '2026-11-14').possible).toBe(35)
  })
})

describe('schema upgrade', () => {
  it('moves the version 3 daily checks into dailyTicks and keeps other data', async () => {
    const name = `daily-upgrade-${n++}`
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
    old.version(3).stores({ dailyChecks: '&itemId' })
    await old.open()
    await old.table('bookmarks').put({ type: 'lastRead', verseKey: '2:255', updatedAt: 1 })
    await old.table('dailyChecks').put({ itemId: 'fajr', date: '2026-11-10' })
    old.close()

    const upgraded = new QuranDB(name)
    expect(await upgraded.bookmarks.count()).toBe(1)
    expect(await upgraded.dailyTicks.toArray()).toEqual([{ date: '2026-11-10', itemId: 'fajr' }])
    expect(upgraded.tables.map((t) => t.name)).not.toContain('dailyChecks')
    await upgraded.delete()
  })
})
