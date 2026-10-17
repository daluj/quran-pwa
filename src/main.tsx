import '@fontsource/amiri-quran/arabic-400.css'
import './styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { DataProvider } from './app/DataProvider'
import { router } from './app/router'
import { SettingsProvider } from './db/SettingsProvider'
import { ThemeProvider } from './theme/ThemeProvider'

// The Quran feed restores its own scroll position; don't let the browser race it.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <DataProvider>
          <RouterProvider router={router} />
        </DataProvider>
      </SettingsProvider>
    </ThemeProvider>
  </StrictMode>,
)
