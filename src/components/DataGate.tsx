import type { ReactNode } from 'react'
import { useData } from '../app/DataProvider'

/** Renders children once the Quran data is in IndexedDB; loading/error states otherwise. */
export function DataGate({ children }: { children: ReactNode }) {
  const { status, retry } = useData()

  if (status.state === 'loading') {
    return (
      <div role="status" className="flex flex-col items-center gap-3 px-4 py-16 text-muted">
        <div className="size-8 animate-spin rounded-full border-3 border-border border-t-accent" aria-hidden="true" />
        <p>Preparing the Quran for offline use…</p>
      </div>
    )
  }

  if (status.state === 'error') {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="font-bold">Couldn't load the Quran data.</p>
        <p className="text-sm text-muted">{status.message}</p>
        <button
          type="button"
          onClick={retry}
          className="rounded-full bg-fg px-5 py-2 font-bold text-bg transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    )
  }

  return children
}
