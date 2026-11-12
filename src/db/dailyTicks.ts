import { useLiveQuery } from 'dexie-react-hooks'
import { db, type QuranDB } from './db'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Local calendar date as `YYYY-MM-DD` (not UTC, so the day ends at the user's midnight). */
export function localDateKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d)
}

/** Milliseconds from `now` until the next local midnight. */
export function msUntilMidnight(now: Date = new Date()): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
}

/** The Sunday on or before `dateKey`: the first day of its week. */
export function weekStartKey(dateKey: string): string {
  const day = parseKey(dateKey)
  return localDateKey(new Date(day.getFullYear(), day.getMonth(), day.getDate() - day.getDay()))
}

/** The seven dates of the week containing `dateKey`, Sunday first. */
export function weekDateKeys(dateKey: string): string[] {
  const start = parseKey(weekStartKey(dateKey))
  return Array.from({ length: 7 }, (_, i) =>
    localDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)),
  )
}

/** Ticks of the week containing `today`. */
export async function getWeekTicks(today: string, database: QuranDB = db) {
  const [start, end] = [weekStartKey(today), weekDateKeys(today)[6]!]
  return database.dailyTicks.where('date').between(start, end, true, true).toArray()
}

/** Tick (add today's row) or untick (remove it) one item; other days are never changed. */
export async function setChecked(
  itemId: string,
  checked: boolean,
  today: string = localDateKey(),
  database: QuranDB = db,
): Promise<void> {
  if (checked) await database.dailyTicks.put({ date: today, itemId })
  else await database.dailyTicks.delete([today, itemId])
}

/** Delete ticks from before the week containing `today`, so nothing outlives its week. */
export async function pruneOldWeeks(today: string, database: QuranDB = db): Promise<void> {
  await database.dailyTicks.where('date').below(weekStartKey(today)).delete()
}

/** Live ticks of this week; empty while loading. */
export function useWeekTicks(today: string) {
  return useLiveQuery(() => getWeekTicks(today), [today], [])
}
