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
      return { key, surah, ayah, textArabic: 'x', textArabicPlain: 'x', translations: { en: 'x', es: 'x' } }
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
    expect(summarizeBackup(backup)).toEqual({ prayer: 6, collection: 1, verses: 3, bookmarks: 1, wordAudioSurahs: 0 })
    expect(backup.settings).toEqual({ theme: 'dark', translationLanguage: 'en', showTranslation: true, englishOnly: false, readingMode: false, arabicFontSize: 34 })
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
    expect(await getSettings(db)).toEqual({ theme: 'dark', translationLanguage: 'en', showTranslation: true, englishOnly: false, readingMode: false, arabicFontSize: 34 })
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

  it('restores the translation language, and reads older backups without it', () => {
    const base = { app: BACKUP_APP, format: 1, lists: [], listItems: [], bookmarks: [] }
    expect(validateBackup({ ...base, settings: { translationLanguage: 'es' } }, () => true).settings.translationLanguage).toBe('es')
    expect(validateBackup({ ...base, settings: { theme: 'dark' } }, () => true).settings.translationLanguage).toBe('en')
    for (const bad of ['fr', 3, null, 'toString']) {
      expect(validateBackup({ ...base, settings: { translationLanguage: bad } }, () => true).settings.translationLanguage).toBe('en')
    }
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
    expect(backup.settings).toEqual({ theme: 'system', translationLanguage: 'en', showTranslation: true, englishOnly: false, readingMode: false, arabicFontSize: 28 })
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

  describe('word audio downloads', () => {
    const row = (surah: number, status: 'complete' | 'partial' | 'wanted') => ({ surah, status, words: 5, bytes: 100, updatedAt: 1 })

    it('exports the downloaded surahs, not the audio', async () => {
      await db.wordAudioDownloads.bulkAdd([row(112, 'complete'), row(2, 'partial'), row(5, 'wanted')])
      const backup = await createBackup(db)
      expect(backup.wordAudioSurahs).toEqual([2, 5, 112])
      expect(summarizeBackup(backup).wordAudioSurahs).toBe(3)
    })

    it('loads an older backup without the field', () => {
      const backup = validateBackup({ app: BACKUP_APP, format: 1, lists: [], listItems: [], bookmarks: [], settings: {} }, () => true)
      expect(backup.wordAudioSurahs).toEqual([])
    })

    it('ignores invalid surahs and duplicates', () => {
      const backup = validateBackup(
        { app: BACKUP_APP, format: 1, lists: [], listItems: [], bookmarks: [], settings: {}, wordAudioSurahs: [3, 0, 115, '2', 2.5, 3, null, 1] },
        () => true,
      )
      expect(backup.wordAudioSurahs).toEqual([1, 3])
    })

    it('restores them as surahs to download again, keeping downloads already on the device', async () => {
      await db.wordAudioDownloads.add(row(112, 'complete'))
      const backup = validateBackup(
        { app: BACKUP_APP, format: 1, lists: [], listItems: [], bookmarks: [], settings: {}, wordAudioSurahs: [2, 112] },
        () => true,
      )
      await restoreBackup(backup, db)
      expect((await db.wordAudioDownloads.get(2))?.status).toBe('wanted')
      expect((await db.wordAudioDownloads.get(112))?.status).toBe('complete')
    })
  })
})
