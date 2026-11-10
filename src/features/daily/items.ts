export interface DailyItem {
  /** Stable key stored in IndexedDB; never change it. */
  id: string
  label: string
  /** Shows an "Open Quran" link. */
  to?: string
}

export const DAILY_ITEMS: DailyItem[] = [
  { id: 'fajr', label: 'Salat Fajr' },
  { id: 'wusta', label: 'Salat Al Wusta' },
  { id: 'isha', label: 'Salat Isha' },
  { id: 'quran-dawn', label: 'Quran at Dawn', to: '/quran' },
  { id: 'quran-night', label: 'Meditate with Quran at Night', to: '/quran' },
]
