import { BookOpen, Compass, HandHeart, ListChecks, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/quran', label: 'Quran', icon: BookOpen },
  { to: '/prayers', label: 'Prayers', icon: HandHeart },
  { to: '/daily', label: 'Daily', icon: ListChecks },
  { to: '/explore', label: 'Explore', icon: Compass },
]

/** Title shown in the header for the current path. */
export function sectionTitle(pathname: string): string {
  return NAV_ITEMS.find((item) => pathname.startsWith(item.to))?.label ?? 'Quran'
}
