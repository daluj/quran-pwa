import type { DailyTick } from '../../db/db'
import { weekDateKeys } from '../../db/dailyTicks'
import type { DailyItem } from './items'

export type CellState = 'done' | 'missed' | 'upcoming'

export interface WeekRow {
  item: DailyItem
  cells: CellState[]
  done: number
}

export interface WeekModel {
  dates: string[]
  /** Index of today in `dates`. */
  todayIndex: number
  rows: WeekRow[]
  done: number
  /** Items x days up to and including today; upcoming days are not counted. */
  possible: number
  /** Days up to and including today. */
  daysSoFar: number
}

/** Grid of the week containing `today`; days after today are upcoming, never missed. */
export function buildWeek(items: DailyItem[], ticks: DailyTick[], today: string): WeekModel {
  const dates = weekDateKeys(today)
  const todayIndex = dates.indexOf(today)
  const ticked = new Set(ticks.map((t) => `${t.date}|${t.itemId}`))
  const rows = items.map((item) => {
    const cells = dates.map((date, i): CellState =>
      i > todayIndex ? 'upcoming' : ticked.has(`${date}|${item.id}`) ? 'done' : 'missed',
    )
    return { item, cells, done: cells.filter((c) => c === 'done').length }
  })
  const daysSoFar = todayIndex + 1
  return {
    dates,
    todayIndex,
    rows,
    done: rows.reduce((sum, r) => sum + r.done, 0),
    possible: items.length * daysSoFar,
    daysSoFar,
  }
}
