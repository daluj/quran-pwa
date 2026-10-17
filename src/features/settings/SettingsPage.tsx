import { Download, Upload } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { buttonStyles } from '../../components/buttonStyles'
import { Dialog } from '../../components/Dialog'
import { Header } from '../../components/layout/Header'
import meta from '../../data/meta.json'
import { SOURCES } from '../../data/sources'
import {
  BackupError,
  backupFileName,
  createBackup,
  parseBackupFile,
  restoreBackup,
  summarizeBackup,
  type Backup,
} from '../../db/backup'
import { ARABIC_FONT_SIZE, type ThemePreference } from '../../db/db'
import { setSetting, useSettings } from '../../db/settings'
import { useTheme } from '../../theme/ThemeProvider'

export function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="divide-y divide-border">
        <AppearanceSection />
        <ReadingSection />
        <DataSection />
        <AboutSection />
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="px-4 py-5">
      <h2 id={id} className="mb-3 text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  )
}

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function AppearanceSection() {
  const { preference, setPreference } = useTheme()
  return (
    <Section title="Appearance">
      <fieldset>
        <legend className="mb-2 text-[15px] text-muted">Theme</legend>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(({ value, label }) => (
            <label
              key={value}
              className={`cursor-pointer rounded-xl border-2 px-3 py-3 text-center font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
                preference === value ? 'border-accent text-accent' : 'border-border hover:bg-hover'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={preference === value}
                onChange={() => setPreference(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </Section>
  )
}

function ReadingSection() {
  const { showTranslation, arabicFontSize } = useSettings()
  const sizeId = useId()

  return (
    <Section title="Reading">
      <div className="flex items-center justify-between gap-4 py-2">
        <span id="translation-label" className="text-[15px]">
          Show English translation
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={showTranslation}
          aria-labelledby="translation-label"
          onClick={() => void setSetting('showTranslation', !showTranslation)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${showTranslation ? 'bg-accent' : 'bg-border'}`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform ${
              showTranslation ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      <div className="py-2">
        <div className="flex items-center justify-between">
          <label htmlFor={sizeId} className="text-[15px]">
            Arabic text size
          </label>
          <span className="text-sm text-muted tabular-nums">{arabicFontSize}px</span>
        </div>
        <input
          id={sizeId}
          type="range"
          min={ARABIC_FONT_SIZE.min}
          max={ARABIC_FONT_SIZE.max}
          step={ARABIC_FONT_SIZE.step}
          value={arabicFontSize}
          onChange={(e) => void setSetting('arabicFontSize', Number(e.target.value))}
          aria-valuetext={`${arabicFontSize} pixels`}
          className="mt-2 w-full accent-[var(--accent)]"
        />
        <p
          lang="ar"
          aria-label="Preview"
          className="quran-text mt-3 rounded-xl bg-surface px-4 py-2 text-center!"
          style={{ ['--arabic-font-size' as string]: `${arabicFontSize}px` }}
        >
          {meta.bismillah}
        </p>
      </div>
    </Section>
  )
}

function DataSection() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup>()
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string }>()
  const persisted = usePersistedStorage()

  async function onExport() {
    const backup = await createBackup()
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName()
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    const s = summarizeBackup(backup)
    setMessage({ kind: 'ok', text: `Exported ${s.prayer + s.collection} lists and ${s.verses} saved verses.` })
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    setMessage(undefined)
    try {
      setPending(await parseBackupFile(await file.text()))
    } catch (err) {
      setMessage({
        kind: 'error',
        text: err instanceof BackupError ? err.message : `Couldn't read the file: ${String(err)}`,
      })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function onRestore() {
    if (!pending) return
    try {
      await restoreBackup(pending)
      setMessage({ kind: 'ok', text: 'Backup restored.' })
    } catch (err) {
      setMessage({ kind: 'error', text: `Restore failed, nothing was changed: ${String(err)}` })
    } finally {
      setPending(undefined)
    }
  }

  const summary = pending && summarizeBackup(pending)

  return (
    <Section title="Your data">
      <p className="text-[15px] text-muted">
        Prayer topics, collections, bookmarks and settings are stored only on this device. Export a backup to keep
        them safe or move them to another device.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => void onExport()} className={`${buttonStyles.secondary} flex items-center gap-2`}>
          <Download className="size-4" aria-hidden="true" />
          Export backup
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`${buttonStyles.secondary} flex items-center gap-2`}
        >
          <Upload className="size-4" aria-hidden="true" />
          Import backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          aria-label="Backup file"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`mt-3 text-sm ${message.kind === 'error' ? 'text-red-600 dark:text-red-400' : 'text-accent'}`}
        >
          {message.text}
        </p>
      )}
      <p className="mt-3 text-sm text-muted">
        {persisted === undefined
          ? ''
          : persisted
            ? 'Storage is persistent: the browser won’t clear it to free up space.'
            : 'The browser may clear this data if the device runs low on space. Export backups regularly.'}
      </p>

      <Dialog
        open={pending !== undefined}
        onClose={() => setPending(undefined)}
        title="Restore this backup?"
        footer={
          <>
            <button type="button" onClick={() => setPending(undefined)} className={buttonStyles.secondary}>
              Cancel
            </button>
            <button type="button" onClick={() => void onRestore()} className={buttonStyles.danger}>
              Replace my data
            </button>
          </>
        }
      >
        {summary && (
          <div className="px-4 py-4 text-[15px]">
            <p>The backup contains:</p>
            <ul className="my-2 list-disc pl-6">
              <li>{summary.prayer} prayer topics</li>
              <li>{summary.collection} collections</li>
              <li>{summary.verses} saved verses</li>
              <li>{summary.bookmarks} bookmarks</li>
            </ul>
            <p className="font-bold">It will replace all your current topics, collections, bookmarks and settings.</p>
          </div>
        )}
      </Dialog>
    </Section>
  )
}

/** Whether the browser granted persistent storage; undefined while checking or unsupported. */
function usePersistedStorage(): boolean | undefined {
  const [persisted, setPersisted] = useState<boolean>()
  useEffect(() => {
    let cancelled = false
    navigator.storage
      ?.persisted?.()
      .then((value) => !cancelled && setPersisted(value))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return persisted
}

function AboutSection() {
  const { arabic, translation } = SOURCES
  return (
    <Section title="About">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
        <dt className="text-muted">Quran text</dt>
        <dd>
          <a href={arabic.url} target="_blank" rel="noreferrer" className="text-accent underline">
            {arabic.name}
          </a>
          <span className="block text-sm text-muted">{arabic.license}</span>
        </dd>
        <dt className="text-muted">Translation</dt>
        <dd>
          {translation.name}
          <span className="block text-sm text-muted">
            {translation.translator} · {translation.license}
          </span>
        </dd>
        <dt className="text-muted">Version</dt>
        <dd>
          {__APP_VERSION__} <span className="text-sm text-muted">(data {meta.version})</span>
        </dd>
      </dl>
    </Section>
  )
}
