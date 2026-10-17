import { useRegisterSW } from 'virtual:pwa-register/react'
import { buttonStyles } from './buttonStyles'

/**
 * Registers the service worker and reports on it: once when the app is ready
 * to work offline, and when an update is waiting. Updates apply only when the
 * user chooses, so a reload never interrupts reading.
 */
export function PwaStatus() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-fg px-4 py-3 text-bg shadow-lg sm:bottom-6"
    >
      <p className="flex-1 text-[15px]">
        {needRefresh ? 'A new version is available.' : 'Ready to work offline.'}
      </p>
      {needRefresh && (
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className={`${buttonStyles.primary} bg-bg text-fg`}
        >
          Update
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setOfflineReady(false)
          setNeedRefresh(false)
        }}
        className="rounded-full px-3 py-2 text-[15px] font-bold opacity-80 hover:opacity-100"
      >
        {needRefresh ? 'Later' : 'OK'}
      </button>
    </div>
  )
}
