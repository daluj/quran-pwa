import { DataGate } from '../../components/DataGate'
import { Header } from '../../components/layout/Header'
import { ListIndex } from '../lists/ListIndex'

/** Prayers section: the user's prayer topics, like X Lists. */
export function PrayersPage() {
  return (
    <>
      <Header />
      <DataGate>
        <ListIndex type="prayer" />
      </DataGate>
    </>
  )
}
