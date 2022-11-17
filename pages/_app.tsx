import '@/styles/globals.css'
import { EmptyLayout } from '@/layouts'
import { AppPropsWithLayout } from '@/types'
import { SWRConfig } from 'swr'
import { axiosClient } from '@/services/axios'
import { CacheProvider } from '@emotion/react'
import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { createEmotionCache, theme } from '@/utils/mui'
import { AppProvider } from '@/contexts'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

function MyApp(props: AppPropsWithLayout) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const Layout = Component.Layout ?? EmptyLayout

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />

        <SWRConfig
          value={{
            shouldRetryOnError: false,
            revalidateOnFocus: false,
            fetcher: (url) => axiosClient.get(url),
          }}
        >
          <AppProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AppProvider>
        </SWRConfig>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default MyApp
