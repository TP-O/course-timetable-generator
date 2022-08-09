import { Footer, Header, Sidebar } from '@/components/common'
import { LayoutProps } from '@/types'
import { Stack } from '@mui/material'
import { Box } from '@mui/system'

export function MainLayout({ children }: LayoutProps) {
  return (
    <Stack
      direction="row"
      sx={{
        width: '100vw',
        minHeight: '100vh',
      }}
    >
      <Sidebar />

      <Stack
        flexGrow={1}
        sx={{
          width: 0, // Make child elements believe width exists =))
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        <Header />

        <Box component="main" flexGrow={1}>
          {children}
        </Box>

        <Footer />
      </Stack>
    </Stack>
  )
}
