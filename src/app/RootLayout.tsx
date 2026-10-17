import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { BottomTabBar } from '../components/layout/BottomTabBar'
import { RightColumn } from '../components/layout/RightColumn'
import { Sidebar } from '../components/layout/Sidebar'

/** X-style shell: left sidebar, ~600px main column, optional right column; bottom tabs on mobile. */
export function RootLayout() {
  const section = useLocation().pathname.split('/')[1]

  // Other sections open at the top; the Quran feed restores its own position.
  useLayoutEffect(() => {
    if (section !== 'quran') window.scrollTo(0, 0)
  }, [section])

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>
      <div className="mx-auto flex justify-center">
        <Sidebar />
        <main
          id="main"
          className="min-h-dvh w-full min-w-0 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:w-[600px] sm:border-x sm:border-border sm:pb-0"
        >
          <Outlet />
        </main>
        <RightColumn />
      </div>
      <BottomTabBar />
    </div>
  )
}
