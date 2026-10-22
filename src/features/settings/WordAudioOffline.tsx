import { useLiveQuery } from 'dexie-react-hooks'
import { memo, useEffect, useState } from 'react'
import { buttonStyles } from '../../components/buttonStyles'
import { Dialog } from '../../components/Dialog'
import { db, type WordAudioDownload } from '../../db/db'
import { useWordAudioDownloads } from '../../db/wordAudioDownloads'
import { usePersistedStorage } from '../../lib/usePersistedStorage'
import {
  cancelDownload,
  dismissDownloadError,
  refreshDownloadStatus,
  removeDownload,
  startDownload,
  useActiveDownload,
  useDownloadError,
  useDownloadProgress,
} from '../../lib/wordAudioDownloads'
import { downloadWarning, estimateBytes, formatBytes, wordCountsBySurah } from '../../lib/wordAudioPlan'

interface Confirm {
  surah: number
  estimate: number
  reason: string
}

/** Where the user keeps the word audio of whole surahs on the device. */
export function WordAudioOffline() {
  const downloads = useWordAudioDownloads()
  const persisted = usePersistedStorage()
  const error = useDownloadError()
  const [open, setOpen] = useState(false)

  const used = [...(downloads?.values() ?? [])].reduce((sum, row) => sum + (row.status === 'wanted' ? 0 : row.bytes), 0)

  return (
    <>
      <p className="text-[15px] text-muted">
        Download a surah’s word audio to tap its words without a connection. Words you have already played also work
        offline. Keep the app open while a surah downloads.
      </p>
      <p className="mt-2 text-sm text-muted">
        {used > 0 ? `Using ${formatBytes(used)} on this device. ` : ''}
        {persisted === undefined
          ? ''
          : persisted
            ? 'Storage is persistent: the browser won’t clear the audio to free up space.'
            : 'The browser may clear the audio if the device runs low on space.'}
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          Surah {error.surah}: {error.message}{' '}
          <button type="button" onClick={dismissDownloadError} className="font-bold underline">
            Dismiss
          </button>
        </p>
      )}
      <details className="mt-3 rounded-xl border border-border" onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="cursor-pointer px-4 py-3 text-[15px] font-bold">Choose surahs</summary>
        {open && <SurahList downloads={downloads} />}
      </details>
    </>
  )
}

function SurahList({ downloads }: { downloads: Map<number, WordAudioDownload> | undefined }) {
  const totals = useLiveQuery(async () => wordCountsBySurah(await db.verses.toArray()), [])
  const active = useActiveDownload()
  const [confirm, setConfirm] = useState<Confirm>()

  // The browser may have cleared the cache since the rows were saved.
  useEffect(() => {
    if (totals) void refreshDownloadStatus(totals)
  }, [totals])

  async function request(surah: number) {
    const estimate = estimateBytes(totals?.get(surah) ?? 0)
    const reason = downloadWarning(estimate, await readEnvironment())
    if (reason) setConfirm({ surah, estimate, reason })
    else void startDownload(surah)
  }

  // The verses may still be seeding on the first launch: no counts yet.
  if (!totals?.size || !downloads) return <p className="px-4 pb-3 text-sm text-muted">Loading…</p>

  return (
    <>
      <ul className="max-h-[60dvh] divide-y divide-border overflow-y-auto border-t border-border">
        {Array.from({ length: 114 }, (_, i) => i + 1).map((surah) => (
          <SurahRow
            key={surah}
            surah={surah}
            words={totals.get(surah) ?? 0}
            row={downloads.get(surah)}
            busy={active !== undefined}
            onDownload={request}
          />
        ))}
      </ul>
      <Dialog
        open={confirm !== undefined}
        onClose={() => setConfirm(undefined)}
        title={confirm ? `Download surah ${confirm.surah}?` : ''}
        footer={
          <>
            <button type="button" onClick={() => setConfirm(undefined)} className={buttonStyles.secondary}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm) void startDownload(confirm.surah)
                setConfirm(undefined)
              }}
              className={buttonStyles.primary}
            >
              Download
            </button>
          </>
        }
      >
        {confirm && (
          <div className="px-4 py-4 text-[15px]">
            <p>
              Surah {confirm.surah} is about <strong>{formatBytes(confirm.estimate)}</strong>. {confirm.reason}
            </p>
            <p className="mt-2 text-muted">Keep the app open while it downloads. You can cancel and resume later.</p>
          </div>
        )}
      </Dialog>
    </>
  )
}

const SurahRow = memo(function SurahRow({
  surah,
  words,
  row,
  busy,
  onDownload,
}: {
  surah: number
  words: number
  row: WordAudioDownload | undefined
  busy: boolean
  onDownload: (surah: number) => void
}) {
  const progress = useDownloadProgress(surah)
  const [removing, setRemoving] = useState(false)
  const words1 = (n: number) => n.toLocaleString('en')

  let status: string
  let actions: { label: string; onClick: () => void; danger?: boolean }[]
  if (progress) {
    status = `${words1(progress.done)} of ${words1(progress.total)} words`
    actions = [{ label: 'Cancel', onClick: cancelDownload }]
  } else if (row?.status === 'complete') {
    status = `Downloaded · ${formatBytes(row.bytes)}`
    actions = [{ label: 'Remove', onClick: () => void remove() }]
  } else if (row?.status === 'partial') {
    status = `${words1(row.words)} of ${words1(words)} words saved · ${formatBytes(row.bytes)}`
    actions = [
      { label: 'Resume', onClick: () => onDownload(surah) },
      { label: 'Remove', onClick: () => void remove() },
    ]
  } else if (row?.status === 'wanted') {
    status = 'In your backup · not on this device'
    actions = [{ label: 'Download', onClick: () => onDownload(surah) }]
  } else {
    status = `${words1(words)} words · about ${formatBytes(estimateBytes(words))}`
    actions = [{ label: 'Download', onClick: () => onDownload(surah) }]
  }

  async function remove() {
    setRemoving(true)
    try {
      await removeDownload(surah)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold">Surah {surah}</p>
          <p className="text-sm text-muted">{status}</p>
        </div>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            aria-label={`${action.label} surah ${surah}`}
            disabled={action.label !== 'Cancel' && (busy || removing)}
            onClick={action.onClick}
            className={`${buttonStyles.secondary} shrink-0 px-3 py-1`}
          >
            {action.label}
          </button>
        ))}
      </div>
      {progress && (
        <div
          role="progressbar"
          aria-label={`Surah ${surah} download`}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.done}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface"
        >
          <div className="h-full bg-accent" style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} />
        </div>
      )}
    </li>
  )
})

interface NetworkInformation {
  saveData?: boolean
  type?: string
}

async function readEnvironment() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  let freeBytes: number | undefined
  try {
    const { quota, usage } = (await navigator.storage?.estimate?.()) ?? {}
    if (quota !== undefined && usage !== undefined) freeBytes = quota - usage
  } catch {
    // No estimate: skip the free-space check.
  }
  return { freeBytes, saveData: connection?.saveData, connectionType: connection?.type }
}
