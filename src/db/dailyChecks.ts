import { useLiveQuery } from 'dexie-react-hooks'
import { db, type QuranDB } from './db'

/** Local calendar date as `YYYY-MM-DD` (not UTC, so the day ends at the user's midnight). */
export function localDateKey(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Milliseconds from `now` until the next local midnight. */
export function msUntilMidnight(now: Date = new Date()): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
}

/** Item ids ticked on the day `today`; rows from earlier days are ignored. */
export async function getCheckedIds(today: string, database: QuranDB = db): Promise<string[]> {
  const rows = await database.dailyChecks.toArray()
  return rows.filter((row) => row.date === today).map((row) => row.itemId)
}

/** Tick (stored with `today`) or untick (row removed) one item. */
export async function setChecked(
  itemId: string,
  checked: boolean,
  today: string = localDateKey(),
  database: QuranDB = db,
): Promise<void> {
  if (checked) await database.dailyChecks.put({ itemId, date: today })
  else await database.dailyChecks.delete(itemId)
}

/** Live ids ticked today; empty while loading. */
export function useCheckedIds(today: string): string[] {
  return useLiveQuery(() => getCheckedIds(today), [today], [])
}
