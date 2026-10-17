// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DataProvider } from '../src/app/DataProvider'
import { routes } from '../src/app/router'
import { db } from '../src/db/db'
import { addVerse, getListItems } from '../src/db/lists'
import { ThemeProvider } from '../src/theme/ThemeProvider'

const versesJson = readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'verses.json'), 'utf8')

// jsdom has no layout. Fake just enough for the virtualizer: a window scroll
// position that scrollTo moves (with the scroll event fired asynchronously,
// as browsers do), feed rows 150px tall, and the list 120px down the page.
let scrollY = 0
const LIST_TOP = 120
const ROW_HEIGHT = 150

function scrollWindowTo(xOrOptions: number | ScrollToOptions, y?: number) {
  scrollY = typeof xOrOptions === 'number' ? (y ?? 0) : (xOrOptions.top ?? scrollY)
  setTimeout(() => window.dispatchEvent(new Event('scroll')), 0)
}

function fakeRect(this: Element): DOMRect {
  const height = this.hasAttribute('data-index') ? ROW_HEIGHT : 0
  const top = this.getAttribute('aria-label') === 'Quran' ? LIST_TOP - scrollY : 0
  return { x: 0, y: top, top, left: 0, right: 560, bottom: top + height, width: 560, height, toJSON() {} }
}

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
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('fetch', vi.fn(async () => new Response(versesJson, { status: 200 })))
  Object.defineProperty(window, 'scrollY', { get: () => scrollY, configurable: true })
  Object.defineProperty(window, 'pageYOffset', { get: () => scrollY, configurable: true })
  window.scrollTo = scrollWindowTo as typeof window.scrollTo
  // jsdom has no modal dialogs.
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
  Element.prototype.getBoundingClientRect = fakeRect
  // Tall enough for the whole feed, so scrolling to a verse isn't clamped.
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    get: () => LIST_TOP + 6350 * ROW_HEIGHT,
  })
  // The virtualizer measures rows with offsetHeight.
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.hasAttribute('data-index') ? ROW_HEIGHT : 0
    },
  })
})

afterEach(async () => {
  cleanup()
  await db.bookmarks.clear()
  scrollY = 0
})

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

const mainNav = () => screen.getAllByRole('navigation', { name: 'Main' })[0]!

describe('app shell', () => {
  it('redirects / to the Quran feed', async () => {
    const router = renderApp('/')
    expect(router.state.location.pathname).toBe('/quran')
    expect(await screen.findByText('Praise be to God, Lord of the Worlds.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Surah 1' })).toBeTruthy()
  })

  it('navigates between the three sections', async () => {
    const router = renderApp('/quran')
    await screen.findByText('Praise be to God, Lord of the Worlds.')
    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Prayers' }))
    expect(router.state.location.pathname).toBe('/prayers')
    for (const topic of ['Forgiveness', 'Guidance', 'Protection', 'Gratitude', 'Patience', 'Mercy']) {
      expect(await screen.findByText(topic)).toBeTruthy()
    }
    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Explore' }))
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

describe('Quran feed', () => {
  it('renders surah headers and verse cards in Arabic', async () => {
    renderApp('/quran')
    await screen.findByText('Praise be to God, Lord of the Worlds.')
    expect(screen.getByRole('region', { name: 'Surah 1, 7 verses' })).toBeTruthy()
    const arabic = document.querySelectorAll('article p[lang="ar"].quran-text')
    expect(arabic.length).toBeGreaterThan(0)
    expect(arabic[0]!.textContent).toBe((await db.verses.get('1:1'))!.textArabic)
  })

  it('scrolls to and highlights a deep-linked verse', async () => {
    renderApp('/quran/2/255')
    const card = await screen.findByRole('article', { name: 'Surah 2, verse 255' })
    expect(card.className).toContain('verse-highlight')
    // Row 2:255 sits after surah 1 (8 rows) and 255 rows of surah 2.
    expect(scrollY).toBeGreaterThan(200 * ROW_HEIGHT)
  })

  it('explains references that do not exist', async () => {
    renderApp('/quran/1/8')
    expect((await screen.findByRole('alert')).textContent).toMatch(/Surah 1 has 7 verses/)
  })

  it('remembers the scroll position when switching tabs', async () => {
    const router = renderApp('/quran/2/255')
    await screen.findByRole('article', { name: 'Surah 2, verse 255' })
    await vi.waitFor(() => expect(scrollY).toBeGreaterThan(0))
    const position = scrollY

    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Prayers' }))
    await screen.findByText('Forgiveness')
    expect(scrollY).toBe(0)

    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Quran' }))
    expect(router.state.location.pathname).toBe('/quran')
    await screen.findByRole('article', { name: 'Surah 2, verse 255' })
    expect(scrollY).toBe(position)
    expect(screen.getByRole('heading', { level: 1, name: 'Surah 2' })).toBeTruthy()
  })

  it('marks a verse as last read and continues reading from it', async () => {
    // Earlier tests leave the feed scrolled elsewhere; open it at the start.
    const router = renderApp('/quran/1/1')
    await screen.findByText('Praise be to God, Lord of the Worlds.')
    const continueReading = screen.getByRole('button', { name: 'Continue reading: no bookmark yet' }) as HTMLButtonElement
    expect(continueReading.disabled).toBe(true)

    const card = screen.getByRole('article', { name: 'Surah 1, verse 5' })
    const markRead = within(card).getByRole('button', { name: 'Mark as last read' })
    await act(async () => fireEvent.click(markRead))
    await vi.waitFor(() => expect(markRead.getAttribute('aria-pressed')).toBe('true'))
    expect(await db.bookmarks.get('lastRead')).toMatchObject({ verseKey: '1:5' })

    const resume = await screen.findByRole('button', { name: 'Continue reading: surah 1, verse 5' })
    fireEvent.click(resume)
    expect(router.state.location.pathname).toBe('/quran/1/5')

    // Only one reading bookmark: marking another verse moves it.
    const other = within(screen.getByRole('article', { name: 'Surah 1, verse 2' })).getByRole('button', {
      name: 'Mark as last read',
    })
    await act(async () => fireEvent.click(other))
    await vi.waitFor(() => expect(markRead.getAttribute('aria-pressed')).toBe('false'))
    expect(await db.bookmarks.count()).toBe(1)
  })
})

describe('lists', () => {
  it('saves a verse into a new collection from the feed', async () => {
    const router = renderApp('/quran/1/1')
    await screen.findByText('Praise be to God, Lord of the Worlds.')
    const card = screen.getByRole('article', { name: 'Surah 1, verse 5' })
    fireEvent.click(within(card).getByRole('button', { name: 'Save to collection' }))

    const sheet = await screen.findByRole('dialog', { name: 'Save to collection · 1:5' })
    fireEvent.change(within(sheet).getByRole('textbox', { name: 'New collection name' }), {
      target: { value: 'Favourites' },
    })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create' }))
    const box = await within(sheet).findByRole('checkbox', { name: /Favourites/ })
    await vi.waitFor(() => expect((box as HTMLInputElement).checked).toBe(true))

    // A duplicate name is refused with a message.
    fireEvent.change(within(sheet).getByRole('textbox', { name: 'New collection name' }), {
      target: { value: 'favourites' },
    })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create' }))
    expect((await within(sheet).findByRole('alert')).textContent).toMatch(/already exists/)

    fireEvent.click(within(sheet).getByRole('button', { name: 'Done' }))
    await vi.waitFor(() =>
      expect(within(card).getByRole('button', { name: 'Saved in collections (edit)' })).toBeTruthy(),
    )

    // The collection shows up in Explore with the verse in it.
    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Explore' }))
    fireEvent.click(await screen.findByRole('link', { name: /Favourites\s*1 verse/ }))
    expect(router.state.location.pathname).toMatch(/^\/explore\/collections\//)
    expect(await screen.findByRole('article', { name: 'Surah 1, verse 5' })).toBeTruthy()
  })

  it('saves a verse into several prayer topics', async () => {
    renderApp('/quran/1/1')
    await screen.findByText('Praise be to God, Lord of the Worlds.')
    const card = screen.getByRole('article', { name: 'Surah 1, verse 6' })
    fireEvent.click(within(card).getByRole('button', { name: 'Save to prayers' }))
    const sheet = await screen.findByRole('dialog', { name: 'Save to prayers · 1:6' })
    fireEvent.click(await within(sheet).findByRole('checkbox', { name: /Guidance/ }))
    fireEvent.click(within(sheet).getByRole('checkbox', { name: /Mercy/ }))
    await vi.waitFor(async () => {
      const lists = await db.lists.where('type').equals('prayer').toArray()
      const withVerse = await db.listItems.where('verseKey').equals('1:6').toArray()
      const names = withVerse.map((i) => lists.find((l) => l.id === i.listId)?.name).sort()
      expect(names).toEqual(['Guidance', 'Mercy'])
    })
  })

  it('reorders, removes, renames and deletes a prayer topic', async () => {
    const patience = (await db.lists.where('name').equals('Patience').first())!
    for (const key of ['2:153', '2:155', '3:200']) await addVerse(patience.id, key)

    const router = renderApp('/prayers')
    fireEvent.click(await screen.findByRole('link', { name: /Patience\s*3 verses/ }))
    expect(router.state.location.pathname).toBe(`/prayers/${patience.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Patience' })).toBeTruthy()

    const order = () => screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))
    await screen.findByRole('article', { name: 'Surah 3, verse 200' })
    expect(screen.getByRole('button', { name: 'Move 2:153 up' })).toHaveProperty('disabled', true)

    fireEvent.click(screen.getByRole('button', { name: 'Move 3:200 up' }))
    await vi.waitFor(() =>
      expect(order()).toEqual(['Surah 2, verse 153', 'Surah 3, verse 200', 'Surah 2, verse 155']),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove 2:153 from Patience' }))
    await vi.waitFor(() => expect(order()).toEqual(['Surah 3, verse 200', 'Surah 2, verse 155']))
    expect((await getListItems(patience.id)).map((i) => i.verseKey)).toEqual(['3:200', '2:155'])

    expect(screen.getAllByRole('link', { name: /Open in Quran/ })[0]!.getAttribute('href')).toBe('/quran/3/200')

    fireEvent.click(screen.getByRole('button', { name: 'Rename prayer topic' }))
    const rename = await screen.findByRole('dialog', { name: 'Rename prayer topic' })
    fireEvent.change(within(rename).getByRole('textbox', { name: 'Name' }), { target: { value: 'Sabr' } })
    fireEvent.click(within(rename).getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Sabr' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Delete prayer topic' }))
    const confirm = await screen.findByRole('dialog', { name: 'Delete prayer topic?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Delete' }))
    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/prayers'))
    expect(await db.lists.get(patience.id)).toBeUndefined()
    expect(await db.listItems.where('listId').equals(patience.id).count()).toBe(0)
  })

  it('shows a message for a topic that does not exist', async () => {
    renderApp('/prayers/not-a-real-id')
    expect(await screen.findByText(/doesn't exist/)).toBeTruthy()
  })
})
