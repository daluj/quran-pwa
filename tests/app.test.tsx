// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DataProvider } from '../src/app/DataProvider'
import { routes } from '../src/app/router'
import { db } from '../src/db/db'
import { ThemeProvider } from '../src/theme/ThemeProvider'

const versesJson = readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'verses.json'), 'utf8')

beforeAll(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
  vi.stubGlobal('fetch', vi.fn(async () => new Response(versesJson, { status: 200 })))
})

afterEach(cleanup)

afterAll(async () => {
  vi.unstubAllGlobals()
  await db.delete()
})

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <ThemeProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </ThemeProvider>,
  )
  return router
}

describe('app shell', () => {
  it('redirects / to the Quran section and seeds the data', async () => {
    const router = renderApp('/')
    expect(router.state.location.pathname).toBe('/quran')
    expect(await screen.findByText(/6,236 verses available offline/)).toBeTruthy()
    expect(await screen.findByText('Praise be to God, Lord of the Worlds.')).toBeTruthy()
    // Al-Fatiha's seven verses render in Arabic with the Quran font class.
    const arabic = document.querySelectorAll('p[lang="ar"].quran-text')
    expect(arabic).toHaveLength(7)
    expect(arabic[0]!.textContent).toBe((await db.verses.get('1:1'))!.textArabic)
  })

  it('navigates between the three sections', async () => {
    const router = renderApp('/quran')
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]!
    fireEvent.click(within(nav).getByRole('link', { name: 'Prayers' }))
    expect(router.state.location.pathname).toBe('/prayers')
    for (const topic of ['Forgiveness', 'Guidance', 'Protection', 'Gratitude', 'Patience', 'Mercy']) {
      expect(await screen.findByText(topic)).toBeTruthy()
    }
    fireEvent.click(within(nav).getByRole('link', { name: 'Explore' }))
    expect(router.state.location.pathname).toBe('/explore')
    expect(screen.getByRole('heading', { level: 1, name: 'Explore' })).toBeTruthy()
  })

  it('cycles the theme and saves the choice', async () => {
    renderApp('/quran')
    const toggle = screen.getAllByRole('button', { name: /^System theme/ })[0]!
    fireEvent.click(toggle)
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(screen.getAllByRole('button', { name: /^Light theme/ })[0]!)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('quran-pwa:theme')).toBe('dark')
    await vi.waitFor(async () => expect((await db.settings.get('theme'))?.value).toBe('dark'))
  })
})
