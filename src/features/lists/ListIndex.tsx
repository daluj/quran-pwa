import { ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Dialog } from '../../components/Dialog'
import type { ListType } from '../../db/db'
import { useLists } from '../../db/listHooks'
import { LIST_ICONS, LIST_LABELS, verseCountLabel } from './labels'
import { NewListForm } from './NewListForm'

/** X Lists–style index: one row per list, plus a "New …" button. */
export function ListIndex({ type }: { type: ListType }) {
  const lists = useLists(type)
  const [creating, setCreating] = useState(false)
  const labels = LIST_LABELS[type]
  const Icon = LIST_ICONS[type]

  return (
    <section aria-label={labels.many}>
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex w-full items-center gap-4 border-b border-border px-4 py-3 text-left transition-colors hover:bg-hover"
      >
        <span className="flex size-12 items-center justify-center rounded-xl border-2 border-dashed border-border text-accent">
          <Plus className="size-6" aria-hidden="true" />
        </span>
        <span className="font-bold text-accent">{labels.newLabel}</span>
      </button>

      {lists?.length === 0 && <p className="px-4 py-8 text-center text-muted">{labels.empty}</p>}

      <ul>
        {lists?.map((list) => (
          <li key={list.id}>
            <Link
              to={`${labels.basePath}/${list.id}`}
              className="flex items-center gap-4 border-b border-border px-4 py-3 transition-colors hover:bg-hover"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface text-accent">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{list.name}</span>
                <span className="text-sm text-muted">{verseCountLabel(list.count)}</span>
              </span>
              <ChevronRight className="size-5 text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <Dialog open={creating} onClose={() => setCreating(false)} title={labels.newLabel}>
        <NewListForm type={type} onCreated={() => setCreating(false)} />
      </Dialog>
    </section>
  )
}
