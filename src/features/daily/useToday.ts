import { useEffect, useState } from 'react'
import { localDateKey, msUntilMidnight } from '../../db/dailyChecks'

/** Today's local date key, refreshed at midnight and when the app is shown again. */
export function useToday(): string {
  const [today, setToday] = useState(() => localDateKey())

  useEffect(() => {
    const refresh = () => setToday(localDateKey())
    // +1s so the timer lands after midnight even if it fires slightly early.
    const timer = setTimeout(refresh, msUntilMidnight() + 1000)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [today])

  return today
}
