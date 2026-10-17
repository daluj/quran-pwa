import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { QuranDB } from '../src/db/db'
import {
  addVerse,
  createList,
  deleteList,
  getListCounts,
  getListItems,
  getLists,
  getSavedVerseKeys,
  getVerseListIds,
  ListError,
  moveVerse,
  removeVerse,
  renameList,
  setVerseInList,
} from '../src/db/lists'

let db: QuranDB
let n = 0

beforeEach(() => {
  db = new QuranDB(`lists-${n++}`)
})

afterEach(async () => {
  await db.delete()
})

const keys = async (listId: string) => (await getListItems(listId, db)).map((i) => i.verseKey)

describe('creating, renaming and deleting lists', () => {
  it('creates lists of each type, oldest first', async () => {
    const a = await createList('collection', '  Morning   reading ', db, 1)
    await createList('collection', 'Favourites', db, 2)
    await createList('prayer', 'Travel', db, 3)
    expect(a).toMatchObject({ name: 'Morning reading', type: 'collection', isDefault: false })
    expect((await getLists('collection', db)).map((l) => l.name)).toEqual(['Morning reading', 'Favourites'])
    expect((await getLists('prayer', db)).map((l) => l.name)).toEqual(['Travel'])
  })

  it('rejects empty, too long and duplicate names (per type, ignoring case)', async () => {
    await expect(createList('prayer', '   ', db)).rejects.toThrow(ListError)
    await expect(createList('prayer', 'x'.repeat(61), db)).rejects.toThrow(/60 characters/)
    await createList('prayer', 'Mercy', db)
    await expect(createList('prayer', 'mercy', db)).rejects.toThrow(/already exists/)
    await expect(createList('collection', 'Mercy', db)).resolves.toMatchObject({ name: 'Mercy' })
  })

  it('renames a list', async () => {
    const list = await createList('prayer', 'Travel', db, 1)
    await createList('prayer', 'Health', db, 2)
    await renameList(list.id, 'Journeys', db, 5)
    expect(await db.lists.get(list.id)).toMatchObject({ name: 'Journeys', updatedAt: 5 })
    await expect(renameList(list.id, 'health', db)).rejects.toThrow(/already exists/)
    await expect(renameList(list.id, 'JOURNEYS', db)).resolves.toBeUndefined()
  })

  it('deletes a list with its verses only', async () => {
    const a = await createList('collection', 'A', db)
    const b = await createList('collection', 'B', db)
    await addVerse(a.id, '2:255', db)
    await addVerse(b.id, '2:255', db)
    await deleteList(a.id, db)
    expect(await db.lists.get(a.id)).toBeUndefined()
    expect(await db.listItems.count()).toBe(1)
    expect(await keys(b.id)).toEqual(['2:255'])
  })
})

describe('verses in lists', () => {
  it('appends verses in order without duplicates', async () => {
    const list = await createList('prayer', 'Mercy', db)
    await addVerse(list.id, '7:156', db)
    await addVerse(list.id, '39:53', db)
    await addVerse(list.id, '7:156', db)
    expect(await keys(list.id)).toEqual(['7:156', '39:53'])
  })

  it('removes a verse', async () => {
    const list = await createList('prayer', 'Mercy', db)
    await addVerse(list.id, '7:156', db)
    await addVerse(list.id, '39:53', db)
    await removeVerse(list.id, '7:156', db)
    expect(await keys(list.id)).toEqual(['39:53'])
    await addVerse(list.id, '7:156', db)
    expect(await keys(list.id)).toEqual(['39:53', '7:156'])
  })

  it('reorders verses and ignores moves past either end', async () => {
    const list = await createList('prayer', 'Mercy', db)
    for (const k of ['1:1', '1:2', '1:3']) await addVerse(list.id, k, db)
    await moveVerse(list.id, '1:3', -1, db)
    expect(await keys(list.id)).toEqual(['1:1', '1:3', '1:2'])
    await moveVerse(list.id, '1:1', -1, db)
    await moveVerse(list.id, '1:2', 1, db)
    expect(await keys(list.id)).toEqual(['1:1', '1:3', '1:2'])
    expect((await getListItems(list.id, db)).map((i) => i.position)).toEqual([0, 1, 2])
  })

  it('lets a verse belong to several lists and reports where it is saved', async () => {
    const mercy = await createList('prayer', 'Mercy', db)
    const forgiveness = await createList('prayer', 'Forgiveness', db)
    const favs = await createList('collection', 'Favourites', db)
    await setVerseInList(mercy.id, '39:53', true, db)
    await setVerseInList(forgiveness.id, '39:53', true, db)
    await setVerseInList(favs.id, '2:255', true, db)

    expect(await getVerseListIds('prayer', '39:53', db)).toEqual(new Set([mercy.id, forgiveness.id]))
    expect(await getVerseListIds('collection', '39:53', db)).toEqual(new Set())

    const saved = await getSavedVerseKeys(db)
    expect(saved.prayer).toEqual(new Set(['39:53']))
    expect(saved.collection).toEqual(new Set(['2:255']))
    expect((await getListCounts(db)).get(mercy.id)).toBe(1)

    await setVerseInList(mercy.id, '39:53', false, db)
    expect(await getVerseListIds('prayer', '39:53', db)).toEqual(new Set([forgiveness.id]))
  })
})
