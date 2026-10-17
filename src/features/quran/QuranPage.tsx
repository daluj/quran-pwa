import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router'
import { DataGate } from '../../components/DataGate'
import { Header } from '../../components/layout/Header'
import { db } from '../../db/db'
import { useSettings } from '../../db/settings'

/** Phase 1 placeholder: confirms the seeded data and the Arabic font. The feed comes in phase 2. */
export function QuranPage() {
  const { surah, ayah } = useParams()

  return (
    <>
      <Header />
      <DataGate>
        <QuranPreview target={surah && ayah ? `${surah}:${ayah}` : undefined} />
      </DataGate>
    </>
  )
}

function QuranPreview({ target }: { target?: string }) {
  const { arabicFontSize, showTranslation } = useSettings()
  const verseCount = useLiveQuery(() => db.verses.count(), [])
  const fatiha = useLiveQuery(() => db.verses.where('surah').equals(1).sortBy('ayah'), [])

  return (
    <div>
      <p className="border-b border-border px-4 py-3 text-sm text-muted">
        {verseCount?.toLocaleString('en')} verses available offline.
        {target && ` Requested verse ${target}.`} The full feed arrives in phase 2.
      </p>
      <ol>
        {fatiha?.map((v) => (
          <li key={v.key} className="border-b border-border px-4 py-3">
            <p className="text-sm text-muted">{v.key}</p>
            <p lang="ar" className="quran-text" style={{ ['--arabic-font-size' as string]: `${arabicFontSize}px` }}>
              {v.textArabic}
            </p>
            {showTranslation && <p className="text-[15px] leading-relaxed">{v.translation}</p>}
          </li>
        ))}
      </ol>
    </div>
  )
}
