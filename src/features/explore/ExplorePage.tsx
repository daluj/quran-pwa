import { useSearchParams } from 'react-router'
import { Header } from '../../components/layout/Header'

/** Phase 1 placeholder. Search and collections come in phase 4. */
export function ExplorePage() {
  const [params] = useSearchParams()
  const q = params.get('q')

  return (
    <>
      <Header />
      <div className="px-4 py-8 text-center text-muted">
        <p>Search and collections arrive in phase 4.</p>
        {q && <p className="mt-2 text-sm">You searched for “{q}”.</p>}
      </div>
    </>
  )
}
