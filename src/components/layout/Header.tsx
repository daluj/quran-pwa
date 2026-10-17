import { useLocation } from 'react-router'
import { Logo } from '../Logo'
import { sectionTitle } from './nav'
import { ThemeToggle } from './ThemeToggle'

/**
 * Sticky header at the top of the main column. On mobile it also carries the
 * logo and theme toggle (the sidebar is hidden there).
 */
export function Header({ title }: { title?: string }) {
  const { pathname } = useLocation()
  const heading = title ?? sectionTitle(pathname)

  return (
    <div className="pt-safe sticky top-0 z-10 border-b border-border bg-header backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4">
        <Logo className="size-7 sm:hidden" />
        <h1 className="flex-1 truncate text-xl font-bold">{heading}</h1>
        <div className="-mr-2 sm:hidden">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
