import { Plus } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import type { List, ListType } from '../../db/db'
import { createList, MAX_LIST_NAME } from '../../db/lists'
import { LIST_LABELS } from './labels'

interface NewListFormProps {
  type: ListType
  onCreated?: (list: List) => void | Promise<void>
}

/** Inline "name + Create" form; shows validation errors (empty, duplicate…). */
export function NewListForm({ type, onCreated }: NewListFormProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const inputId = useId()
  const errorId = useId()
  const label = LIST_LABELS[type].newLabel

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const list = await createList(type, name)
      setName('')
      setError(undefined)
      await onCreated?.(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="px-4 py-3">
      <label htmlFor={inputId} className="sr-only">
        {label} name
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(undefined)
          }}
          maxLength={MAX_LIST_NAME}
          placeholder={`${label} name`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 rounded-full border border-border bg-transparent px-4 py-2 text-[15px] outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy || name.trim() === ''}
          className="flex items-center gap-1 rounded-full bg-fg px-4 py-2 text-[15px] font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 px-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}
