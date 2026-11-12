import { Check, Minus } from 'lucide-react'
import { useId } from 'react'
import type { DailyTick } from '../../db/db'
import { DAILY_ITEMS } from './items'
import { buildWeek, type CellState } from './week'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const STATE_LABEL: Record<CellState, string> = { done: 'Done', missed: 'Not done', upcoming: 'Upcoming' }

/** This week, Sunday to Saturday: what was done each day. Read-only. */
export function WeekGrid({ ticks, today }: { ticks: DailyTick[]; today: string }) {
  const headingId = useId()
  const week = buildWeek(DAILY_ITEMS, ticks, today)

  return (
    <section aria-labelledby={headingId} className="px-4 py-5">
      <h2 id={headingId} className="text-xl font-bold">
        This week
      </h2>
      <p className="mb-3 text-muted">
        {week.done} of {week.possible} done so far
      </p>
      <table className="w-full table-fixed border-collapse text-sm">
        <caption className="sr-only">Checklist for this week, Sunday to Saturday</caption>
        <thead>
          <tr>
            <td className="w-[34%]" />
            {week.dates.map((date, i) => (
              <th
                key={date}
                scope="col"
                aria-current={i === week.todayIndex ? 'date' : undefined}
                className={`px-0.5 pb-2 text-center font-normal ${i === week.todayIndex ? 'font-bold text-accent' : 'text-muted'}`}
              >
                {DAY_NAMES[i]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {week.rows.map((row) => (
            <tr key={row.item.id} className="border-t border-border">
              <th scope="row" className="py-2 pr-2 text-left font-normal">
                <span className="block break-words">{row.item.label}</span>
                <span className="text-muted">
                  {row.done} of {week.daysSoFar}
                </span>
              </th>
              {row.cells.map((state, i) => (
                <td
                  key={week.dates[i]}
                  className={`py-2 text-center ${i === week.todayIndex ? 'bg-hover' : ''}`}
                >
                  <span className="inline-flex" role="img" aria-label={STATE_LABEL[state]}>
                    {state === 'done' && <Check className="size-4 text-accent" aria-hidden="true" />}
                    {state === 'missed' && <span className="size-4 rounded-sm border border-border" />}
                    {state === 'upcoming' && <Minus className="size-4 text-muted opacity-50" aria-hidden="true" />}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
