import { FolderOpen, HandHeart } from 'lucide-react'
import type { ListType } from '../../db/db'

export const LIST_ICONS = { prayer: HandHeart, collection: FolderOpen }

/** UI wording and routes for each kind of list. */
export const LIST_LABELS: Record<
  ListType,
  { one: string; many: string; newLabel: string; saveLabel: string; basePath: string; empty: string }
> = {
  collection: {
    one: 'collection',
    many: 'Collections',
    newLabel: 'New collection',
    saveLabel: 'Save to collection',
    basePath: '/explore/collections',
    empty: 'No collections yet.',
  },
  prayer: {
    one: 'prayer topic',
    many: 'Prayer topics',
    newLabel: 'New topic',
    saveLabel: 'Save to prayers',
    basePath: '/prayers',
    empty: 'No prayer topics yet.',
  },
}

export function verseCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'verse' : 'verses'}`
}
