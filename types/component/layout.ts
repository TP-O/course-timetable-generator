import { EmotionCache } from '@emotion/cache'
import { NextPage } from 'next'
import { AppProps } from 'next/app'
import { ReactElement, ReactNode } from 'react'

export type LayoutProps = {
  children: ReactNode
}

/**
 * NextPage-like type, but with Layout property.
 */
export type NextPageWithLayout = NextPage & {
  Layout?: (props: LayoutProps) => ReactElement
}

/**
 * Customized AppProps type to add more features
 * like: layout, material UI...
 */
export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
  emotionCache?: EmotionCache
}
