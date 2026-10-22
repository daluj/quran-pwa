import { useLiveQuery } from 'dexie-react-hooks'
import { db, type QuranDB, type WordAudioDownload } from './db'

/** Downloads by surah number; undefined while loading. */
export function useWordAudioDownloads(): Map<number, WordAudioDownload> | undefined {
  return useLiveQuery(
    async () => new Map((await db.wordAudioDownloads.toArray()).map((row) => [row.surah, row])),
    [],
  )
}

export async function saveDownload(
  row: Omit<WordAudioDownload, 'updatedAt'>,
  database: QuranDB = db,
): Promise<void> {
  await database.wordAudioDownloads.put({ ...row, updatedAt: Date.now() })
}

export async function removeDownloadRow(surah: number, database: QuranDB = db): Promise<void> {
  await database.wordAudioDownloads.delete(surah)
}

/** Remember surahs from a backup that aren't on this device yet. Existing rows are kept. */
export async function markWanted(surahs: number[], database: QuranDB = db): Promise<void> {
  await database.transaction('rw', database.wordAudioDownloads, async () => {
    for (const surah of surahs) {
      if (await database.wordAudioDownloads.get(surah)) continue
      await database.wordAudioDownloads.add({ surah, status: 'wanted', words: 0, bytes: 0, updatedAt: Date.now() })
    }
  })
}
