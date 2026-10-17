import { Monitor, Moon, Sun } from 'lucide-react'
import type { ThemePreference } from '../../db/db'
import { useTheme } from '../../theme/ThemeProvider'

const NEXT: Record<ThemePreference, ThemePreference> = { system: 'light', light: 'dark', dark: 'system' }
const LABELS: Record<ThemePreference, string> = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' }
const ICONS = { system: Monitor, light: Sun, dark: Moon }

/** Cycles system → light → dark. `showLabel` adds the text label (wide sidebar). */
export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { preference, setPreference } = useTheme()
  const Icon = ICONS[preference]
  const next = NEXT[preference]

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={`${LABELS[preference]}. Switch to ${LABELS[next].toLowerCase()}`}
      title={LABELS[preference]}
      className="flex items-center gap-4 rounded-full p-3 text-fg transition-colors hover:bg-hover"
    >
      <Icon className="size-6" aria-hidden="true" />
      {showLabel && <span className="hidden pr-4 text-xl xl:inline">{LABELS[preference]}</span>}
    </button>
  )
}
