import { ArrowLeft } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { Link, useLocation } from 'react-router'
import { Logo } from '../Logo'
import { sectionTitle } from './nav'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  title?: string
  subtitle?: string
  /** Shows a back arrow linking here instead of the mobile logo. */
  backTo?: string
  backLabel?: string
  /** Buttons on the right of the title row. */
  actions?: ReactNode
  /** Extra row under the title (e.g. quick actions). */
  children?: ReactNode
  ref?: Ref<HTMLDivElement>
}

/**
 * Sticky header at the top of the main column. On mobile it also carries the
 * logo and theme toggle (the sidebar is hidden there).
 */
export function Header({ title, subtitle, backTo, backLabel = 'Back', actions, children, ref }: HeaderProps) {
  const { pathname } = useLocation()
  const heading = title ?? sectionTitle(pathname)

  return (
    <div ref={ref} className="pt-safe sticky top-0 z-10 border-b border-border bg-header backdrop-blur-md">
      <div className="flex min-h-14 items-center gap-3 px-4">
        {backTo ? (
          <Link to={backTo} aria-label={backLabel} className="-ml-2 rounded-full p-2 transition-colors hover:bg-hover">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        ) : (
          <Logo className="size-7 shrink-0 sm:hidden" />
        )}
        <div className="min-w-0 flex-1 py-1">
          <h1 className="truncate text-xl leading-6 font-bold">{heading}</h1>
          {subtitle && <p className="truncate text-[13px] text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center">{actions}</div>}
        <div className="-mr-2 sm:hidden">
          <ThemeToggle />
        </div>
      </div>
      {children}
    </div>
  )
}
