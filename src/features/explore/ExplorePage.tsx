import { useSearchParams } from 'react-router'
import { DataGate } from '../../components/DataGate'
import { Header } from '../../components/layout/Header'
import { ListIndex } from '../lists/ListIndex'

/** Explore: search (phase 4) above the user's collections. */
export function ExplorePage() {
  const [params] = useSearchParams()
  const q = params.get('q')

  return (
    <>
      <Header />
      <div className="border-b border-border px-4 py-6 text-center text-muted">
        <p>Search arrives in phase 4.</p>
        {q && <p className="mt-2 text-sm">You searched for “{q}”.</p>}
      </div>
      <h2 className="px-4 pt-4 pb-2 text-xl font-bold">Collections</h2>
      <DataGate>
        <ListIndex type="collection" />
      </DataGate>
    </>
  )
}
