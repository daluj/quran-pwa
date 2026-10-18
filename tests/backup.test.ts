import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  BACKUP_APP,
  backupFileName,
  createBackup,
  parseBackupFile,
  restoreBackup,
  summarizeBackup,
  validateBackup,
} from '../src/db/backup'
import { toggleBookmark } from '../src/db/bookmarks'
import { QuranDB } from '../src/db/db'
import { addVerse, createList, getListItems } from '../src/db/lists'
import { seedDefaultLists } from '../src/db/seed'
import { getSettings, setSetting } from '../src/db/settings'

let db: QuranDB
let n = 0

const VERSES = ['1:1', '1:2', '2:255', '39:53']

beforeEach(async () => {
  db = new QuranDB(`backup-${n++}`)
  await db.verses.bulkAdd(
    VERSES.map((key) => {
      const [surah, ayah] = key.split(':').map(Number) as [number, number]
      return { key, surah, ayah, textArabic: 'x', textArabicPlain: 'x', translation: 'x' }
    }),
  )
})

afterEach(async () => {
  await db.delete()
})

async function sampleData() {
  await seedDefaultLists(
    db,
    ['Forgiveness', 'Guidance', 'Protection', 'Gratitude', 'Patience', 'Mercy'].map((name) => ({
      type: 'prayer' as const,
      name,
      verses: [],
    })),
  )
  const mercy = (await db.lists.where('name').equals('Mercy').first())!
  await addVerse(mercy.id, '39:53', db)
  await addVerse(mercy.id, '1:1', db)
  const favs = await createList('collection', 'Favourites', db)
  await addVerse(favs.id, '2:255', db)
  await toggleBookmark('lastRead', '2:255', db)
  await setSetting('theme', 'dark', db)
  await setSetting('arabicFontSize', 34, db)
  return { mercy, favs }
}

const roundTrip = async (backup: unknown) => parseBackupFile(JSON.stringify(backup), db)

describe('backup', () => {
  it('names the file with the date', () => {
    expect(backupFileName(new Date(2026, 9, 7))).toBe('quran-pwa-backup-2026-10-07.json')
  })

  it('exports lists, saved verses, bookmarks and settings', async () => {
    await sampleData()
    const backup = await createBackup(db, new Date('2026-10-17T10:00:00Z'))
    expect(backup).toMatchObject({ app: BACKUP_APP, format: 1, exportedAt: '2026-10-17T10:00:00.000Z' })
    expect(summarizeBackup(backup)).toEqual({ prayer: 6, collection: 1, verses: 3, bookmarks: 1 })
    expect(backup.settings).toEqual({ theme: 'dark', showTranslation: true, englishOnly: false, readingMode: false, arabicFontSize: 34 })
  })

  it('restores everything after the data is wiped', async () => {
    const { mercy } = await sampleData()
    const file = JSON.stringify(await createBackup(db))

    await Promise.all([db.lists.clear(), db.listItems.clear(), db.bookmarks.clear(), db.settings.clear()])
    await createList('prayer', 'Something else', db)

    await restoreBackup(await parseBackupFile(file, db), db)
    expect((await db.lists.toArray()).map((l) => l.name).sort()).toContain('Favourites')
    expect(await db.lists.where('name').equals('Something else').count()).toBe(0)
    expect((await getListItems(mercy.id, db)).map((i) => i.verseKey)).toEqual(['39:53', '1:1'])
    expect(await db.bookmarks.get('lastRead')).toMatchObject({ verseKey: '2:255' })
    expect(await getSettings(db)).toEqual({ theme: 'dark', showTranslation: true, englishOnly: false, readingMode: false, arabicFontSize: 34 })
    expect(await db.verses.count()).toBe(VERSES.length)
  })

  it('rejects files that are not backups', async () => {
    await expect(parseBackupFile('not json', db)).rejects.toThrow(/valid JSON/)
    await expect(roundTrip({ hello: 1 })).rejects.toThrow(/isn't a Quran app backup/)
    await expect(roundTrip({ app: BACKUP_APP, format: 99 })).rejects.toThrow(/format 99/)
  })

  it('rejects broken or inconsistent contents', async () => {
    await sampleData()
    const good = await createBackup(db)
    const variants: Array<[string, (b: typeof good) => unknown, RegExp]> = [
      ['missing lists', (b) => ({ ...b, lists: undefined }), /“lists” is missing/],
      ['bad list type', (b) => ({ ...b, lists: [{ ...b.lists[0], type: 'other' }, ...b.lists.slice(1)] }), /List 1/],
      ['duplicate list id', (b) => ({ ...b, lists: [...b.lists, b.lists[0]] }), /same id/],
      [
        'orphan item',
        (b) => ({ ...b, listItems: [...b.listItems, { ...b.listItems[0], id: 'x', listId: 'nope' }] }),
        /isn't in the file/,
      ],
      [
        'unknown verse',
        (b) => ({ ...b, listItems: [{ ...b.listItems[0], verseKey: '2:999' }, ...b.listItems.slice(1)] }),
        /2:999/,
      ],
      ['duplicate verse', (b) => ({ ...b, listItems: [...b.listItems, { ...b.listItems[0], id: 'y' }] }), /twice/],
      ['bad bookmark', (b) => ({ ...b, bookmarks: [{ type: 'lastRead', verseKey: '9:999', updatedAt: 1 }] }), /Bookmark 1/],
      ['missing settings', (b) => ({ ...b, settings: undefined }), /settings/],
    ]
    for (const [name, mutate, message] of variants) {
      await expect(roundTrip(mutate(good)), name).rejects.toThrow(message)
    }
  })

  it('restores the English-only setting, and reads older backups without it', () => {
    const base = { app: BACKUP_APP, format: 1, lists: [], listItems: [], bookmarks: [] }
    const on = validateBackup({ ...base, settings: { englishOnly: true } }, () => true)
    expect(on.settings.englishOnly).toBe(true)
    const older = validateBackup({ ...base, settings: { theme: 'dark', showTranslation: false } }, () => true)
    expect(older.settings).toMatchObject({ theme: 'dark', showTranslation: false, englishOnly: false, readingMode: false })
    const reading = validateBackup({ ...base, settings: { readingMode: true } }, () => true)
    expect(reading.settings.readingMode).toBe(true)
  })

  it('falls back to defaults for unusable settings', () => {
    const backup = validateBackup(
      {
        app: BACKUP_APP,
        format: 1,
        lists: [],
        listItems: [],
        bookmarks: [],
        settings: { theme: 'neon', showTranslation: 'yes', englishOnly: 1, arabicFontSize: 400 },
      },
      () => true,
    )
    expect(backup.settings).toEqual({ theme: 'system', showTranslation: true, englishOnly: false, readingMode: false, arabicFontSize: 28 })
  })

  it('leaves the data untouched when a restore fails midway', async () => {
    await sampleData()
    const before = await createBackup(db)
    const backup = await createBackup(db)
    // Two list items with the same id make bulkAdd fail inside the transaction.
    backup.listItems.push({ ...backup.listItems[0]!, listId: backup.lists[1]!.id })
    await expect(restoreBackup(backup, db)).rejects.toThrow()
    const after = await createBackup(db)
    expect({ ...after, exportedAt: '' }).toEqual({ ...before, exportedAt: '' })
  })
})
