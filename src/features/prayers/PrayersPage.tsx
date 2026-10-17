import { useLiveQuery } from 'dexie-react-hooks'
import { HandHeart } from 'lucide-react'
import { DataGate } from '../../components/DataGate'
import { Header } from '../../components/layout/Header'
import { db } from '../../db/db'

/** Phase 1 placeholder: lists the prayer topics. Topic feeds and editing come in phase 3. */
export function PrayersPage() {
  return (
    <>
      <Header />
      <DataGate>
        <TopicList />
      </DataGate>
    </>
  )
}

function TopicList() {
  const topics = useLiveQuery(() => db.lists.where('type').equals('prayer').sortBy('createdAt'), [])

  return (
    <ul>
      {topics?.map((t) => (
        <li key={t.id} className="flex items-center gap-4 border-b border-border px-4 py-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-surface text-accent">
            <HandHeart className="size-6" aria-hidden="true" />
          </span>
          <span className="font-bold">{t.name}</span>
        </li>
      ))}
    </ul>
  )
}
