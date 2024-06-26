import { Footer, Header, Sidebar } from '@/components/common'
import { LayoutProps } from '@/types/component'
import { Stack } from '@mui/material'
import { Box } from '@mui/system'
import { CommonLayout } from './common'

export function MainLayout({ children }: LayoutProps) {
  return (
    <CommonLayout>
      <Stack direction="row" sx={{ minHeight: '100vh' }}>
        <Sidebar />

        <Stack
          flexGrow={1}
          sx={{
            width: 0, // Make child elements believe width exists =))
            minHeight: '100vh',
          }}
        >
          <Header />

          <Box component="main" flexGrow={1}>
            {children}
          </Box>

          <Footer />
        </Stack>
      </Stack>
    </CommonLayout>
  )
}
