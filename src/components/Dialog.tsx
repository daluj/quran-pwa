import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Buttons pinned under the content. */
  footer?: ReactNode
}

/**
 * Modal built on the native <dialog>: focus trap, Esc to close and an inert
 * background come from the browser. A bottom sheet on mobile, centered from
 * the `sm` breakpoint. Content unmounts when closed, so its state resets.
 */
export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the dialog element itself (not its content) is the backdrop.
      onClick={(e) => e.target === ref.current && onClose()}
      className="pb-safe m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-hidden rounded-t-2xl bg-bg p-0 text-fg shadow-xl backdrop:bg-black/50 sm:m-auto dark:border dark:border-border dark:backdrop:bg-[#5b7083]/40 sm:max-h-[80dvh] sm:max-w-md sm:rounded-2xl"
    >
      {open && (
        <div className="flex max-h-[inherit] flex-col">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-ml-2 rounded-full p-2 transition-colors hover:bg-hover"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <h2 id={titleId} className="flex-1 truncate text-lg font-bold">
              {title}
            </h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
