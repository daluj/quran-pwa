import { NavLink } from 'react-router'
import { NAV_ITEMS } from './nav'

/** Mobile bottom navigation. */
export function BottomTabBar() {
  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 backdrop-blur sm:hidden"
    >
      <ul className="flex h-14 items-stretch justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex flex-1">
            <NavLink
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${
                  isActive ? 'font-bold text-fg' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-6" strokeWidth={isActive ? 2.6 : 1.8} aria-hidden="true" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
