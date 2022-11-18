import { Footer } from '@/components/common'
import { LayoutProps } from '@/types/component'
import { Stack } from '@mui/material'
import { CommonLayout } from './common'

export function EmptyLayout({ children }: LayoutProps) {
  return (
    <CommonLayout>
      <Stack
        sx={{
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack
          flexGrow={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </Stack>

        <Footer />
      </Stack>
    </CommonLayout>
  )
}
