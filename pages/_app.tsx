import '../styles/globals.css'
import { EmptyLayout } from '@/layouts'
import { AppPropsWithLayout } from '@/types/layout'

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const Layout = Component.Layout ?? EmptyLayout

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
