import { Settings } from 'lucide-react'
import { NavLink } from 'react-router'
import { Logo } from '../Logo'
import { NAV_ITEMS } from './nav'
import { ThemeToggle } from './ThemeToggle'

/** Desktop/tablet left column: icons only below xl, icons + labels from xl. */
export function Sidebar() {
  return (
    <header className="sticky top-0 hidden h-dvh shrink-0 flex-col items-center px-2 py-2 sm:flex sm:w-[88px] xl:w-[275px] xl:items-stretch">
      <NavLink to="/quran" className="mb-2 rounded-full p-3 hover:bg-hover xl:self-start" aria-label="Quran home">
        <Logo />
      </NavLink>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center gap-5 rounded-full p-3 text-xl transition-colors hover:bg-hover xl:self-start xl:pr-6 ${
                isActive ? 'font-bold' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-7" strokeWidth={isActive ? 2.6 : 1.8} aria-hidden="true" />
                <span className="hidden xl:inline">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center xl:items-start">
        <NavLink
          to="/settings"
          aria-label="Settings"
          className={({ isActive }) =>
            `flex items-center gap-4 rounded-full p-3 text-xl transition-colors hover:bg-hover xl:pr-6 ${isActive ? 'font-bold' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <Settings className="size-6" strokeWidth={isActive ? 2.6 : 1.8} aria-hidden="true" />
              <span className="hidden xl:inline">Settings</span>
            </>
          )}
        </NavLink>
        <ThemeToggle showLabel />
      </div>
    </header>
  )
}
