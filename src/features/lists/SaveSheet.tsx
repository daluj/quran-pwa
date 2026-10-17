import { Check } from 'lucide-react'
import type { ListType } from '../../db/db'
import { useLists, useVerseListIds } from '../../db/listHooks'
import { addVerse, setVerseInList } from '../../db/lists'
import { buttonStyles } from '../../components/buttonStyles'
import { Dialog } from '../../components/Dialog'
import { LIST_LABELS, verseCountLabel } from './labels'
import { NewListForm } from './NewListForm'

export interface SaveTarget {
  type: ListType
  verseKey: string
}

/**
 * Sheet to save a verse into one or more collections or prayer topics, or
 * into a new one. Changes apply as soon as a box is ticked.
 */
export function SaveSheet({ target, onClose }: { target: SaveTarget | null; onClose: () => void }) {
  const labels = target ? LIST_LABELS[target.type] : undefined
  return (
    <Dialog
      open={target !== null}
      onClose={onClose}
      title={target && labels ? `${labels.saveLabel} · ${target.verseKey}` : ''}
      footer={
        <button type="button" onClick={onClose} className={buttonStyles.primary}>
          Done
        </button>
      }
    >
      {target && <SaveSheetBody target={target} />}
    </Dialog>
  )
}

function SaveSheetBody({ target: { type, verseKey } }: { target: SaveTarget }) {
  const lists = useLists(type)
  const selected = useVerseListIds(type, verseKey)
  const labels = LIST_LABELS[type]

  return (
    <>
      <NewListFormInline type={type} verseKey={verseKey} />
      {lists && lists.length === 0 && <p className="px-4 py-6 text-center text-muted">{labels.empty}</p>}
      <ul aria-label={labels.many}>
        {lists?.map((list) => {
          const checked = selected?.has(list.id) ?? false
          return (
            <li key={list.id}>
              <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-hover">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => void setVerseInList(list.id, verseKey, e.target.checked)}
                  className="peer sr-only"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{list.name}</span>
                  <span className="text-sm text-muted">{verseCountLabel(list.count)}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                    checked ? 'border-accent bg-accent text-accent-fg' : 'border-muted'
                  }`}
                >
                  {checked && <Check className="size-4" strokeWidth={3} />}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </>
  )
}

/** Creating a list from the sheet also saves the verse into it. */
function NewListFormInline({ type, verseKey }: SaveTarget) {
  return (
    <div className="border-b border-border">
      <NewListForm type={type} onCreated={(list) => addVerse(list.id, verseKey)} />
    </div>
  )
}
