// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import axe from 'axe-core'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DataProvider } from '../src/app/DataProvider'
import { routes } from '../src/app/router'
import { db } from '../src/db/db'
import { SettingsProvider } from '../src/db/SettingsProvider'
import { addVerse, createList, getListItems } from '../src/db/lists'
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
  // index.html sets this.
  document.documentElement.lang = 'en'
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
      <SettingsProvider>
        <DataProvider>
          <RouterProvider router={router} />
        </DataProvider>
      </SettingsProvider>
    </ThemeProvider>,
  )
  return router
}

const mainNav = () => screen.getAllByRole('navigation', { name: 'Main' })[0]!

describe('app shell', () => {
  it('redirects / to the Quran feed', async () => {
    const router = renderApp('/')
    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/quran'))
    expect(await screen.findByText('Praise be to God, Lord of the Worlds.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Surah 1' })).toBeTruthy()
  })

  it('navigates between the three sections', async () => {
    const router = renderApp('/quran')
    await screen.findByText('Praise be to God, Lord of the Worlds.')
    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Prayers' }))
    expect(router.state.location.pathname).toBe('/prayers')
    for (const topic of ['Forgiveness', 'Guidance', 'Protection', 'Gratitude', 'Patience', 'Provisions', 'Knowledge']) {
      expect(await screen.findByText(topic)).toBeTruthy()
    }
    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Explore' }))
    expect(router.state.location.pathname).toBe('/explore')
    expect(screen.getByRole('heading', { level: 1, name: 'Explore' })).toBeTruthy()
  })

  it('cycles the theme and saves the choice', async () => {
    renderApp('/quran')
    const toggle = (await screen.findAllByRole('button', { name: /^System theme/ }))[0]!
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

  it('makes every Arabic word a button that plays its audio, and a second tap stops it', async () => {
    const wordFetch = vi.fn<(url: RequestInfo | URL) => Promise<Response>>(async () => new Response(new Blob(['mp3']), { status: 200 }))
    const realFetch = fetch
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('audio.qurancdn.com') ? wordFetch(input) : realFetch(input, init),
    )
    URL.createObjectURL = vi.fn(() => 'blob:word')
    URL.revokeObjectURL = vi.fn()
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
    HTMLMediaElement.prototype.pause = vi.fn()

    renderApp('/quran/1/1')
    const card = await screen.findByRole('article', { name: 'Surah 1, verse 1' })
    const words = within(card.querySelector<HTMLElement>('p[lang="ar"]')!).getAllByRole('button')
    const verse = (await db.verses.get('1:1'))!
    expect(words.map((w) => w.textContent)).toEqual(verse.textArabic.split(' '))

    fireEvent.click(words[1]!)
    expect(wordFetch).toHaveBeenCalledWith('https://audio.qurancdn.com/wbw/001_001_002.mp3')
    expect(words[1]!.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(words[1]!)
    expect(words[1]!.getAttribute('aria-pressed')).toBe('false')
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
    const continueReading = screen.getByRole('button', { name: /Continue reading\s*not set/ }) as HTMLButtonElement
    expect(continueReading.disabled).toBe(true)

    const card = screen.getByRole('article', { name: 'Surah 1, verse 5' })
    const markRead = within(card).getByRole('button', { name: 'Mark as last read' })
    await act(async () => fireEvent.click(markRead))
    await vi.waitFor(() => expect(markRead.getAttribute('aria-pressed')).toBe('true'))
    expect(await db.bookmarks.get('lastRead')).toMatchObject({ verseKey: '1:5' })

    const resume = await screen.findByRole('button', { name: /Continue reading\s*1:5/ })
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
    // 1:6 is already in the default Guidance topic.
    expect((await within(sheet).findByRole('checkbox', { name: /Guidance/ }) as HTMLInputElement).checked).toBe(true)
    fireEvent.click(within(sheet).getByRole('checkbox', { name: /Knowledge/ }))
    fireEvent.click(within(sheet).getByRole('checkbox', { name: /Provisions/ }))
    await vi.waitFor(async () => {
      const lists = await db.lists.where('type').equals('prayer').toArray()
      const withVerse = await db.listItems.where('verseKey').equals('1:6').toArray()
      const names = withVerse.map((i) => lists.find((l) => l.id === i.listId)?.name).sort()
      expect(names).toEqual(['Guidance', 'Knowledge', 'Provisions'])
    })
  })

  it('reorders, removes, renames and deletes a prayer topic', async () => {
    const patience = await createList('prayer', 'Steadfastness')
    for (const key of ['2:153', '2:155', '3:200']) await addVerse(patience.id, key)

    const router = renderApp('/prayers')
    fireEvent.click(await screen.findByRole('link', { name: /Steadfastness\s*3 verses/ }))
    expect(router.state.location.pathname).toBe(`/prayers/${patience.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: 'Steadfastness' })).toBeTruthy()

    const order = () => screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))
    await screen.findByRole('article', { name: 'Surah 3, verse 200' })
    expect(screen.getByRole('button', { name: 'Move 2:153 up' })).toHaveProperty('disabled', true)

    fireEvent.click(screen.getByRole('button', { name: 'Move 3:200 up' }))
    await vi.waitFor(() =>
      expect(order()).toEqual(['Surah 2, verse 153', 'Surah 3, verse 200', 'Surah 2, verse 155']),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove 2:153 from Steadfastness' }))
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

describe('Explore search', () => {
  const searchBox = () => screen.findByRole('searchbox')

  it('goes to a verse reference', async () => {
    const router = renderApp('/explore')
    fireEvent.change(await searchBox(), { target: { value: '2 255' } })
    fireEvent.click(await screen.findByRole('link', { name: 'Go to 2:255' }))
    expect(router.state.location.pathname).toBe('/quran/2/255')
  })

  it('goes straight to a reference on Enter', async () => {
    const router = renderApp('/explore')
    await screen.findByRole('heading', { level: 2, name: 'Collections' })
    fireEvent.change(await searchBox(), { target: { value: '36' } })
    fireEvent.submit(screen.getByRole('search'))
    await vi.waitFor(() => expect(router.state.location.pathname).toBe('/quran/36/1'))
  })

  it('explains references that do not exist', async () => {
    renderApp('/explore')
    fireEvent.change(await searchBox(), { target: { value: '114:7' } })
    expect(await screen.findByText(/Surah 114 has 6 verses/)).toBeTruthy()
  })

  it('searches the translation and highlights the match', async () => {
    const router = renderApp('/explore')
    fireEvent.change(await searchBox(), { target: { value: 'lord of the WORLDS' } })
    const status = await screen.findByText(/verses? match/)
    expect(status.textContent).toMatch(/in the translation/)
    expect(router.state.location.search).toBe('?q=lord+of+the+WORLDS')

    const first = within(screen.getByRole('list', { name: 'Search results' })).getAllByRole('link')[0]!
    expect(first.getAttribute('href')).toBe('/quran/1/2')
    expect([...first.closest('li')!.querySelectorAll('mark')].map((m) => m.textContent)).toContain('Lord of the Worlds')
    fireEvent.click(first)
    expect(router.state.location.pathname).toBe('/quran/1/2')
  })

  it('searches the Arabic ignoring diacritics and letter variants', async () => {
    renderApp('/explore?q=' + encodeURIComponent('الحمد لله رب العالمين'))
    const status = await screen.findByText(/verses? match/)
    expect(status.textContent).toMatch(/in the Arabic/)
    const first = within(screen.getByRole('list', { name: 'Search results' })).getAllByRole('link')[0]!
    expect(first.getAttribute('href')).toBe('/quran/1/2')
    // The whole verse is marked, inside the Arabic text.
    const marked = first.closest('li')!.querySelector('p[lang="ar"] mark')
    expect(marked?.textContent).toBe((await db.verses.get('1:2'))!.textArabic)
  })

  it('says when nothing matches and shows collections when empty', async () => {
    renderApp('/explore?q=zzqx')
    expect((await screen.findByText(/No verses match/)).textContent).toContain('“zzqx”')
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Collections' })).toBeTruthy()
  })
})

describe('Settings', () => {
  it('turns the translation off and changes the Arabic size', async () => {
    renderApp('/settings')
    const toggle = await screen.findByRole('switch', { name: 'Show translation' })
    expect(toggle.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(toggle)
    await vi.waitFor(() => expect(toggle.getAttribute('aria-checked')).toBe('false'))

    const slider = screen.getByRole('slider', { name: 'Arabic text size' })
    fireEvent.change(slider, { target: { value: '40' } })
    await vi.waitFor(async () => expect((await db.settings.get('arabicFontSize'))?.value).toBe(40))
    await vi.waitFor(() => expect(screen.getByLabelText('Preview').getAttribute('style')).toContain('40px'))

    // The feed follows both settings.
    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Quran' }))
    await screen.findByRole('article', { name: 'Surah 1, verse 2' })
    expect(screen.queryByText('Praise be to God, Lord of the Worlds.')).toBeNull()

    await db.settings.clear()
  })

  it('shows only the English translation everywhere', async () => {
    const router = renderApp('/settings')
    fireEvent.click(await screen.findByRole('switch', { name: 'Only show translation' }))
    const translation = screen.getByRole('switch', { name: 'Show translation' })
    await vi.waitFor(() => expect(translation).toHaveProperty('disabled', true))
    expect(translation.getAttribute('aria-checked')).toBe('true')

    // Feed: translation shown, no Arabic, no Arabic Bismillah in surah headers.
    fireEvent.click(within(mainNav()).getByRole('link', { name: 'Quran' }))
    await router.navigate('/quran/2/1')
    const card = await screen.findByRole('article', { name: 'Surah 2, verse 1' })
    expect(within(card).getByText('A. L. M.')).toBeTruthy()
    expect(document.querySelectorAll('main p[lang="ar"]')).toHaveLength(0)

    // An Arabic search still shows the Arabic it matched.
    await router.navigate('/explore?q=' + encodeURIComponent('الحمد لله'))
    await screen.findByText(/in the Arabic/)
    expect(document.querySelectorAll('ol[aria-label="Search results"] p[lang="ar"]').length).toBeGreaterThan(0)

    await db.settings.clear()
  })

  it('shows the Spanish translation in the feed, search and settings', async () => {
    const router = renderApp('/settings')
    const select = await screen.findByRole('combobox', { name: 'Translation language' })
    expect(screen.queryByText(/not yet reviewed/)).toBeNull()
    fireEvent.change(select, { target: { value: 'es' } })
    await vi.waitFor(async () => expect((await db.settings.get('translationLanguage'))?.value).toBe('es'))
    expect(await screen.findByText(/not yet reviewed/)).toBeTruthy()

    await router.navigate('/quran/1/1')
    const card = await screen.findByRole('article', { name: 'Surah 1, verse 2' })
    expect(card.querySelector('p[lang="es"]')?.textContent).toMatch(/Señor de los mundos/)
    expect(within(card).queryByText('Praise be to God, Lord of the Worlds.')).toBeNull()

    await router.navigate('/explore?q=' + encodeURIComponent('señor de los mundos'))
    await screen.findByText(/in the translation/)
    expect(document.querySelectorAll('ol[aria-label="Search results"] p[lang="es"]').length).toBeGreaterThan(0)

    // Translation-only mode follows the language.
    await db.settings.put({ key: 'englishOnly', value: true })
    await router.navigate('/quran/1/1')
    const only = await screen.findByRole('article', { name: 'Surah 1, verse 2' })
    expect(only.querySelector('p[lang="es"]')).toBeTruthy()
    expect(document.querySelectorAll('main p[lang="ar"]')).toHaveLength(0)

    await db.settings.clear()
  })

  it('reading mode shows only the verse number and text', async () => {
    const router = renderApp('/settings')
    fireEvent.click(await screen.findByRole('switch', { name: 'Reading mode' }))
    await vi.waitFor(async () => expect((await db.settings.get('readingMode'))?.value).toBe(true))

    await router.navigate('/quran/1/1')
    const card = await screen.findByRole('article', { name: 'Surah 1, verse 2' })
    // No action buttons: the only buttons left are the tappable Arabic words.
    const arabic = card.querySelector('p[lang="ar"]')!
    expect(within(card).queryAllByRole('button').filter((b) => !arabic.contains(b))).toHaveLength(0)
    expect(within(card).queryByText(/1:2/)).toBeNull()
    expect(within(card).getByText('2')).toBeTruthy()
    expect(card.querySelector('p[lang="ar"]')).toBeTruthy()
    expect(within(card).getByText('Praise be to God, Lord of the Worlds.')).toBeTruthy()

    // Surah headers stay.
    expect(screen.getByRole('region', { name: 'Surah 1, 7 verses' })).toBeTruthy()
    await db.settings.clear()
  })

  it('picks a theme', async () => {
    renderApp('/settings')
    fireEvent.click(await screen.findByRole('radio', { name: 'Dark' }))
    await vi.waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'))
    fireEvent.click(screen.getByRole('radio', { name: 'System' }))
    await vi.waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'))
    await db.settings.clear()
  })

  it('exports a backup and restores it after confirmation', async () => {
    const mercy = (await db.lists.where('name').equals('Knowledge').first())!
    await addVerse(mercy.id, '39:53')

    let exported = ''
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: (blob: Blob) => {
        void blob.text().then((t) => (exported = t))
        return 'blob:backup'
      },
      revokeObjectURL: () => {},
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    renderApp('/settings')
    fireEvent.click(await screen.findByRole('button', { name: 'Export backup' }))
    await vi.waitFor(() => expect(exported).not.toBe(''))
    expect(click).toHaveBeenCalled()
    expect(await screen.findByText(/Exported \d+ lists/)).toBeTruthy()
    click.mockRestore()
    vi.stubGlobal('URL', URL)

    // Change things, then restore the export.
    await db.listItems.where('listId').equals(mercy.id).delete()
    const file = new File([exported], 'backup.json', { type: 'application/json' })
    fireEvent.change(screen.getByLabelText('Backup file'), { target: { files: [file] } })
    const confirm = await screen.findByRole('dialog', { name: 'Restore this backup?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Replace my data' }))
    expect(await screen.findByText('Backup restored.')).toBeTruthy()
    expect((await getListItems(mercy.id)).map((i) => i.verseKey)).toContain('39:53')
  })

  it('refuses a file that is not a backup', async () => {
    renderApp('/settings')
    const file = new File(['{"hello":1}'], 'other.json', { type: 'application/json' })
    fireEvent.change(await screen.findByLabelText('Backup file'), { target: { files: [file] } })
    expect((await screen.findByRole('alert')).textContent).toMatch(/isn't a Quran app backup/)
    expect(screen.queryByRole('dialog', { name: 'Restore this backup?' })).toBeNull()
  })
})

describe('Word audio offline', () => {
  // Cache Storage and the audio CDN, faked: each word is a 1 KB file.
  function fakeAudioDownloads() {
    const store = new Map<string, Response>()
    vi.stubGlobal('caches', {
      open: async () => ({
        put: async (url: string, response: Response) => void store.set(url, response),
        keys: async () => [...store.keys()].map((url) => ({ url })),
        match: async (request: string | { url: string }) => store.get(typeof request === 'string' ? request : request.url)?.clone(),
        delete: async (url: string) => store.delete(url),
      }),
      match: async () => undefined,
    })
    const realFetch = fetch
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('audio.qurancdn.com')
        ? Promise.resolve(new Response(new Uint8Array(1024), { status: 200 }))
        : realFetch(input, init),
    )
    return store
  }

  async function openSurahList() {
    renderApp('/settings')
    const details = (await screen.findByText('Choose surahs')).closest('details')!
    details.open = true
    fireEvent(details, new Event('toggle'))
    await within(details).findByText('Surah 112')
    return details
  }

  afterEach(async () => {
    await db.wordAudioDownloads.clear()
    // Only the globals faked here: the layout fakes from beforeAll stay.
    vi.stubGlobal('caches', undefined)
    vi.stubGlobal('fetch', vi.fn(async () => new Response(versesJson, { status: 200 })))
  })

  it('lists the 114 surahs by number, with an estimate', async () => {
    fakeAudioDownloads()
    const details = await openSurahList()
    expect(within(details).getAllByRole('listitem')).toHaveLength(114)
    expect(within(details).getByText('Surah 1')).toBeTruthy()
    expect(within(details).getByText('29 words · about 2 MB')).toBeTruthy()
  })

  it('downloads a surah, shows it as downloaded, and removes it', async () => {
    const store = fakeAudioDownloads()
    await openSurahList()
    fireEvent.click(screen.getByRole('button', { name: 'Download surah 112' }))
    await vi.waitFor(async () => expect((await db.wordAudioDownloads.get(112))?.status).toBe('complete'))
    expect(store.size).toBe(15)
    expect(await screen.findByText(/Downloaded · 15 KB/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Remove surah 112' }))
    await vi.waitFor(async () => expect(await db.wordAudioDownloads.get(112)).toBeUndefined())
    expect(store.size).toBe(0)
    expect(await screen.findByText('15 words · about 825 KB')).toBeTruthy()
  })

  it('asks before downloading a large surah, and does nothing on Cancel', async () => {
    const store = fakeAudioDownloads()
    await openSurahList()
    fireEvent.click(screen.getByRole('button', { name: 'Download surah 2' }))
    const dialog = await screen.findByRole('dialog', { name: 'Download surah 2?' })
    expect(within(dialog).getByText(/This is a large download/)).toBeTruthy()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(store.size).toBe(0)
    expect(await db.wordAudioDownloads.count()).toBe(0)
  })

  it('shows surahs from a backup as not on this device', async () => {
    fakeAudioDownloads()
    await db.wordAudioDownloads.put({ surah: 112, status: 'wanted', words: 0, bytes: 0, updatedAt: 1 })
    await openSurahList()
    expect(await screen.findByText('In your backup · not on this device')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download surah 112' })).toBeTruthy()
  })

  it('has no accessibility violations with the list open', async () => {
    fakeAudioDownloads()
    await openSurahList()
    const { violations } = await axe.run(
      { exclude: [['nav.fixed']] },
      { rules: { 'color-contrast': { enabled: false } }, resultTypes: ['violations'] },
    )
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
  })
})

describe('accessibility (axe)', () => {
  // Color contrast needs real layout; it's checked in a browser instead. The
  // sidebar and the mobile tab bar are both "Main" navigation, and CSS shows
  // only one of them at any width; jsdom loads no CSS, so leave the tab bar out.
  const runAxe = () =>
    axe.run(
      { exclude: [['nav.fixed']] },
      { rules: { 'color-contrast': { enabled: false } }, resultTypes: ['violations'] },
    )

  it.each([
    ['/quran/1/1', 'Praise be to God, Lord of the Worlds.'],
    ['/prayers', 'Forgiveness'],
    ['/explore?q=mercy', 'Show more results'],
    ['/settings', 'Your data'],
  ])('%s has no violations', async (path, ready) => {
    renderApp(path)
    await screen.findAllByText(new RegExp(ready))
    const { violations } = await runAxe()
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
  })
})
