import { ArrowDown, ArrowUp, BookOpen, Pencil, Trash2, X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { buttonStyles } from '../../components/buttonStyles'
import { DataGate } from '../../components/DataGate'
import { Dialog } from '../../components/Dialog'
import { Header } from '../../components/layout/Header'
import type { List, ListType } from '../../db/db'
import { useList, useListEntries, type ListEntry } from '../../db/listHooks'
import { deleteList, MAX_LIST_NAME, moveVerse, removeVerse, renameList } from '../../db/lists'
import { useSettings, useTextVisibility } from '../../db/settings'
import { LIST_LABELS, verseCountLabel } from './labels'

/** One prayer topic or collection: its verses as a feed, with editing. */
export function ListDetailPage({ type }: { type: ListType }) {
  const { listId } = useParams()
  const list = useList(listId)
  const entries = useListEntries(listId)
  const labels = LIST_LABELS[type]
  const [dialog, setDialog] = useState<'rename' | 'delete' | null>(null)

  // Wrong type (e.g. a collection id under /prayers) is treated as missing.
  const found = list && list.type === type ? list : list === undefined ? undefined : null

  return (
    <>
      <Header
        title={found?.name ?? labels.many}
        subtitle={found && entries ? verseCountLabel(entries.length) : undefined}
        backTo={type === 'prayer' ? '/prayers' : '/explore'}
        backLabel={type === 'prayer' ? 'Back to prayers' : 'Back to explore'}
        actions={
          found && (
            <>
              <button
                type="button"
                onClick={() => setDialog('rename')}
                aria-label={`Rename ${labels.one}`}
                title={`Rename ${labels.one}`}
                className="rounded-full p-2 transition-colors hover:bg-hover"
              >
                <Pencil className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setDialog('delete')}
                aria-label={`Delete ${labels.one}`}
                title={`Delete ${labels.one}`}
                className="rounded-full p-2 text-red-600 transition-colors hover:bg-red-600/10 dark:text-red-400"
              >
                <Trash2 className="size-5" aria-hidden="true" />
              </button>
            </>
          )
        }
      />

      <DataGate>
        {found === null && (
          <p className="px-4 py-12 text-center text-muted">This {labels.one} doesn't exist. It may have been deleted.</p>
        )}
        {found && entries && <Entries list={found} entries={entries} />}
      </DataGate>

      {found && (
        <>
          <RenameDialog list={found} open={dialog === 'rename'} onClose={() => setDialog(null)} />
          <DeleteDialog
            list={found}
            count={entries?.length ?? 0}
            open={dialog === 'delete'}
            onClose={() => setDialog(null)}
          />
        </>
      )}
    </>
  )
}

function Entries({ list, entries }: { list: List; entries: ListEntry[] }) {
  const { arabicFontSize } = useSettings()
  const { arabic: showArabic, english: showEnglish } = useTextVisibility()
  const labels = LIST_LABELS[list.type]

  if (entries.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-muted">
        <p className="font-bold text-fg">No verses yet.</p>
        <p className="mt-1">
          In the <Link to="/quran" className="text-accent underline">Quran</Link>, use “{labels.saveLabel}” on a verse to
          add it here.
        </p>
      </div>
    )
  }

  return (
    <ol aria-label={`Verses in ${list.name}`} style={{ ['--arabic-font-size' as string]: `${arabicFontSize}px` }}>
      {entries.map(({ item, verse }, index) => (
        <li key={item.id}>
          <article
            aria-label={`Surah ${verse.surah}, verse ${verse.ayah}`}
            className="border-b border-border px-4 pt-3 pb-1"
          >
            <p aria-hidden="true" className="text-[15px]">
              <span className="font-bold">Surah {verse.surah}</span>
              <span className="text-muted"> · {verse.key}</span>
            </p>
            {showArabic && (
              <p lang="ar" className="quran-text mt-1">
                {verse.textArabic}
              </p>
            )}
            {showEnglish && <p className="mt-1 text-[15px] leading-relaxed">{verse.translation}</p>}

            <div role="group" aria-label={`Actions for verse ${verse.key}`} className="-ml-2 mt-1 flex flex-wrap gap-1">
              <IconAction
                icon={ArrowUp}
                label={`Move ${verse.key} up`}
                disabled={index === 0}
                onClick={() => void moveVerse(list.id, verse.key, -1)}
              />
              <IconAction
                icon={ArrowDown}
                label={`Move ${verse.key} down`}
                disabled={index === entries.length - 1}
                onClick={() => void moveVerse(list.id, verse.key, 1)}
              />
              <IconAction
                icon={X}
                label={`Remove ${verse.key} from ${list.name}`}
                onClick={() => void removeVerse(list.id, verse.key)}
              />
              <Link
                to={`/quran/${verse.surah}/${verse.ayah}`}
                className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-accent/10 hover:text-accent"
              >
                <BookOpen className="size-[18px]" aria-hidden="true" />
                Open in Quran
                <span className="sr-only">: {verse.key}</span>
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ol>
  )
}

function IconAction({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: typeof ArrowUp
  label: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="rounded-full p-2 text-muted transition-colors hover:bg-accent/10 hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </button>
  )
}

function RenameDialog({ list, open, onClose }: { list: List; open: boolean; onClose: () => void }) {
  const labels = LIST_LABELS[list.type]
  return (
    <Dialog open={open} onClose={onClose} title={`Rename ${labels.one}`}>
      <RenameForm list={list} onDone={onClose} />
    </Dialog>
  )
}

function RenameForm({ list, onDone }: { list: List; onDone: () => void }) {
  const [name, setName] = useState(list.name)
  const [error, setError] = useState<string>()
  const inputId = useId()
  const errorId = useId()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await renameList(list.id, name)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 px-4 py-4">
      <label htmlFor={inputId} className="text-sm text-muted">
        Name
      </label>
      <input
        id={inputId}
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setError(undefined)
        }}
        maxLength={MAX_LIST_NAME}
        autoFocus
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-accent"
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className={buttonStyles.secondary}>
          Cancel
        </button>
        <button type="submit" disabled={name.trim() === ''} className={buttonStyles.primary}>
          Save
        </button>
      </div>
    </form>
  )
}

function DeleteDialog({ list, count, open, onClose }: { list: List; count: number; open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const labels = LIST_LABELS[list.type]

  async function onDelete() {
    await deleteList(list.id)
    onClose()
    navigate(list.type === 'prayer' ? '/prayers' : '/explore', { replace: true })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Delete ${labels.one}?`}
      footer={
        <>
          <button type="button" onClick={onClose} className={buttonStyles.secondary}>
            Cancel
          </button>
          <button type="button" onClick={() => void onDelete()} className={buttonStyles.danger}>
            Delete
          </button>
        </>
      }
    >
      <p className="px-4 py-4 text-[15px]">
        “{list.name}” and its {verseCountLabel(count)} will be removed. The verses stay in the Quran. This can't be
        undone.
      </p>
    </Dialog>
  )
}
