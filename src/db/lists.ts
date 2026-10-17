import { db, type List, type ListItem, type ListType, type QuranDB } from './db'

// Prayer topics and collections share these helpers; `type` tells them apart.

export const MAX_LIST_NAME = 60

export class ListError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ListError'
  }
}

function cleanName(name: string): string {
  const clean = name.replace(/\s+/g, ' ').trim()
  if (clean === '') throw new ListError('Give it a name.')
  if (clean.length > MAX_LIST_NAME) throw new ListError(`Names can be up to ${MAX_LIST_NAME} characters.`)
  return clean
}

async function assertUniqueName(database: QuranDB, type: ListType, name: string, exceptId?: string): Promise<void> {
  const lower = name.toLowerCase()
  const clash = await database.lists
    .where('type')
    .equals(type)
    .filter((l) => l.id !== exceptId && l.name.toLowerCase() === lower)
    .first()
  if (clash) throw new ListError(`“${clash.name}” already exists.`)
}

/** Lists of one type, oldest first (keeps the default prayer topics in order). */
export function getLists(type: ListType, database: QuranDB = db): Promise<List[]> {
  return database.lists.where('type').equals(type).sortBy('createdAt')
}

export async function createList(type: ListType, name: string, database: QuranDB = db, now = Date.now()) {
  const clean = cleanName(name)
  return database.transaction('rw', database.lists, async () => {
    await assertUniqueName(database, type, clean)
    const list: List = { id: crypto.randomUUID(), name: clean, type, isDefault: false, createdAt: now, updatedAt: now }
    await database.lists.add(list)
    return list
  })
}

export async function renameList(id: string, name: string, database: QuranDB = db, now = Date.now()) {
  const clean = cleanName(name)
  await database.transaction('rw', database.lists, async () => {
    const list = await database.lists.get(id)
    if (!list) throw new ListError('That list no longer exists.')
    await assertUniqueName(database, list.type, clean, id)
    await database.lists.update(id, { name: clean, updatedAt: now })
  })
}

/** Delete a list and all its verses. */
export async function deleteList(id: string, database: QuranDB = db): Promise<void> {
  await database.transaction('rw', database.lists, database.listItems, async () => {
    await database.listItems.where('listId').equals(id).delete()
    await database.lists.delete(id)
  })
}

/** Items of a list in their saved order. */
export function getListItems(listId: string, database: QuranDB = db): Promise<ListItem[]> {
  return database.listItems
    .where('[listId+position]')
    .between([listId, -Infinity], [listId, Infinity])
    .toArray()
}

/** Add a verse at the end of a list. No-op if it's already there. */
export async function addVerse(listId: string, verseKey: string, database: QuranDB = db, now = Date.now()) {
  await database.transaction('rw', database.lists, database.listItems, async () => {
    if (await database.listItems.where({ listId, verseKey }).first()) return
    const last = await database.listItems
      .where('[listId+position]')
      .between([listId, -Infinity], [listId, Infinity])
      .last()
    await database.listItems.add({
      id: crypto.randomUUID(),
      listId,
      verseKey,
      position: (last?.position ?? -1) + 1,
      addedAt: now,
    })
    await database.lists.update(listId, { updatedAt: now })
  })
}

export async function removeVerse(listId: string, verseKey: string, database: QuranDB = db, now = Date.now()) {
  await database.transaction('rw', database.lists, database.listItems, async () => {
    await database.listItems.where({ listId, verseKey }).delete()
    await database.lists.update(listId, { updatedAt: now })
  })
}

/** Add the verse to the list or remove it from it. */
export async function setVerseInList(
  listId: string,
  verseKey: string,
  included: boolean,
  database: QuranDB = db,
): Promise<void> {
  if (included) await addVerse(listId, verseKey, database)
  else await removeVerse(listId, verseKey, database)
}

/** Move a verse one place up (-1) or down (+1) within its list. */
export async function moveVerse(
  listId: string,
  verseKey: string,
  direction: -1 | 1,
  database: QuranDB = db,
  now = Date.now(),
): Promise<void> {
  await database.transaction('rw', database.lists, database.listItems, async () => {
    const items = await getListItems(listId, database)
    const from = items.findIndex((i) => i.verseKey === verseKey)
    const to = from + direction
    if (from < 0 || to < 0 || to >= items.length) return
    ;[items[from], items[to]] = [items[to]!, items[from]!]
    // Renumber 0..n-1 so positions stay dense after any earlier removals.
    await database.listItems.bulkPut(items.map((item, position) => ({ ...item, position })))
    await database.lists.update(listId, { updatedAt: now })
  })
}

/** Ids of the lists of `type` that contain the verse. */
export async function getVerseListIds(type: ListType, verseKey: string, database: QuranDB = db): Promise<Set<string>> {
  const [lists, items] = await Promise.all([
    database.lists.where('type').equals(type).primaryKeys(),
    database.listItems.where('verseKey').equals(verseKey).toArray(),
  ])
  const ofType = new Set(lists)
  return new Set(items.filter((i) => ofType.has(i.listId)).map((i) => i.listId))
}

export interface SavedVerseKeys {
  collection: Set<string>
  prayer: Set<string>
}

/** Verse keys saved in any collection / any prayer topic (for filled icons in the feed). */
export async function getSavedVerseKeys(database: QuranDB = db): Promise<SavedVerseKeys> {
  const [lists, items] = await Promise.all([database.lists.toArray(), database.listItems.toArray()])
  const typeOf = new Map(lists.map((l) => [l.id, l.type]))
  const saved: SavedVerseKeys = { collection: new Set(), prayer: new Set() }
  for (const item of items) {
    const type = typeOf.get(item.listId)
    if (type) saved[type].add(item.verseKey)
  }
  return saved
}

/** Number of verses in each list, by list id. */
export async function getListCounts(database: QuranDB = db): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  await database.listItems.each((item) => counts.set(item.listId, (counts.get(item.listId) ?? 0) + 1))
  return counts
}
