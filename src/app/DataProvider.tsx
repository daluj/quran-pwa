import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { initDatabase } from '../db/init'

export type DataStatus = { state: 'loading' } | { state: 'ready' } | { state: 'error'; message: string }

interface DataContextValue {
  status: DataStatus
  retry: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

/** Seeds IndexedDB on startup and exposes whether the Quran data is ready. */
export function DataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<DataStatus>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    initDatabase()
      .then(() => !cancelled && setStatus({ state: 'ready' }))
      .catch((error: unknown) => {
        if (cancelled) return
        setStatus({ state: 'error', message: error instanceof Error ? error.message : String(error) })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setStatus({ state: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return <DataContext.Provider value={{ status, retry }}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
