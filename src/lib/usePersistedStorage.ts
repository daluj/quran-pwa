import { useEffect, useState } from 'react'

/** Whether the browser granted persistent storage; undefined while checking or unsupported. */
export function usePersistedStorage(): boolean | undefined {
  const [persisted, setPersisted] = useState<boolean>()
  useEffect(() => {
    let cancelled = false
    navigator.storage
      ?.persisted?.()
      .then((value) => !cancelled && setPersisted(value))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return persisted
}
