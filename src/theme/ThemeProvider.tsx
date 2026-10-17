import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ThemePreference } from '../db/db'
import { getSettings, setSetting } from '../db/settings'

type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

// Mirror of the IndexedDB setting, read by the inline script in index.html.
const STORAGE_KEY = 'quran-pwa:theme'
const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#ffffff', dark: '#000000' }
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function readCachedPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    // Storage unavailable (private mode, blocked); fall back to system.
  }
  return 'system'
}

function cachePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // Ignore: IndexedDB still has the setting.
  }
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readCachedPreference)
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches)

  // IndexedDB is the source of truth; sync once it's readable.
  useEffect(() => {
    let cancelled = false
    getSettings()
      .then(({ theme }) => {
        if (cancelled) return
        setPreferenceState(theme)
        cachePreference(theme)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const query = darkQuery()
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const resolved: ResolvedTheme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved])
  }, [resolved])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    cachePreference(next)
    void setSetting('theme', next)
  }, [])

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
