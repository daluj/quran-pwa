import '@fontsource/amiri-quran/arabic-400.css'
import './styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { registerSW } from 'virtual:pwa-register'
import { DataProvider } from './app/DataProvider'
import { router } from './app/router'
import { ThemeProvider } from './theme/ThemeProvider'

// The Quran feed restores its own scroll position; don't let the browser race it.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// Precache the app shell, fonts and Quran data; updates apply automatically.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </ThemeProvider>
  </StrictMode>,
)
