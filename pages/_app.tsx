import '@/styles/globals.css'
import { EmptyLayout } from '@/layouts'
import { AppPropsWithLayout } from '@/types/layout'
import { SWRConfig } from 'swr'
import { axiosClient } from '@/services/axios'

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const Layout = Component.Layout ?? EmptyLayout

  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
        fetcher: (url) => axiosClient.get(url),
      }}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SWRConfig>
  )
}

export default MyApp
