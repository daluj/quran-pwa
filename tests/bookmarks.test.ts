import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getBookmarks, toggleBookmark } from '../src/db/bookmarks'
import { QuranDB } from '../src/db/db'

let db: QuranDB
let n = 0

beforeEach(() => {
  db = new QuranDB(`bookmarks-${n++}`)
})

afterEach(async () => {
  await db.delete()
})

describe('toggleBookmark', () => {
  it('sets a bookmark', async () => {
    expect(await toggleBookmark('lastRead', '2:255', db, 1)).toBe(true)
    expect(await getBookmarks(db)).toEqual({ lastRead: '2:255' })
    expect(await db.bookmarks.get('lastRead')).toEqual({ type: 'lastRead', verseKey: '2:255', updatedAt: 1 })
  })

  it('keeps only one bookmark per type', async () => {
    await toggleBookmark('lastRead', '2:255', db)
    await toggleBookmark('lastRead', '18:10', db)
    expect(await db.bookmarks.count()).toBe(1)
    expect(await getBookmarks(db)).toEqual({ lastRead: '18:10' })
  })

  it('clears the bookmark when toggling the same verse', async () => {
    await toggleBookmark('lastRead', '2:255', db)
    expect(await toggleBookmark('lastRead', '2:255', db)).toBe(false)
    expect(await getBookmarks(db)).toEqual({})
  })

  it('tracks reading and recitation independently', async () => {
    await toggleBookmark('lastRead', '2:255', db)
    await toggleBookmark('lastRecited', '36:1', db)
    await toggleBookmark('lastRecited', '36:1', db)
    expect(await getBookmarks(db)).toEqual({ lastRead: '2:255' })
  })
})
