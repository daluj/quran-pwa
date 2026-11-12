import { Link } from 'react-router'
import { Header } from '../../components/layout/Header'
import { useEffect } from 'react'
import { pruneOldWeeks, setChecked, useWeekTicks } from '../../db/dailyTicks'
import { DAILY_ITEMS } from './items'
import { useToday } from './useToday'
import { WeekGrid } from './WeekGrid'

/** Today's checklist; it starts unchecked every day and keeps no history. */
export function DailyPage() {
  const today = useToday()
  const ticks = useWeekTicks(today)
  const checked = ticks.filter((t) => t.date === today).map((t) => t.itemId)

  // A new week starts on Sunday: drop what is older.
  useEffect(() => {
    void pruneOldWeeks(today)
  }, [today])

  const done = DAILY_ITEMS.filter((item) => checked.includes(item.id)).length

  return (
    <>
      <Header />
      <p className="border-b border-border px-4 py-3 text-muted" aria-live="polite">
        {done} of {DAILY_ITEMS.length} done today
      </p>
      <ul>
        {DAILY_ITEMS.map((item) => {
          const isDone = checked.includes(item.id)
          return (
            <li key={item.id} className="flex items-center gap-4 border-b border-border px-4 py-3">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-4">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={(e) => void setChecked(item.id, e.target.checked, today)}
                  className="size-5 shrink-0 accent-accent"
                />
                <span className={isDone ? 'text-muted line-through' : 'font-bold'}>{item.label}</span>
              </label>
              {item.to && (
                <Link to={item.to} className="shrink-0 text-sm font-bold text-accent hover:underline">
                  Open Quran
                </Link>
              )}
            </li>
          )
        })}
      </ul>
      <WeekGrid ticks={ticks} today={today} />
    </>
  )
}
