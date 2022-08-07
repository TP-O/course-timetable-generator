import { MainLayout } from '@/layouts'
import { NextPageWithLayout } from '@/types'

const Saved: NextPageWithLayout = () => {
  return (
    <div>
      <h1>Saved page</h1>
    </div>
  )
}

Saved.Layout = MainLayout

export default Saved