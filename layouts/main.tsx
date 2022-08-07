import { Footer, Header, Sidebar } from '@/components/common'
import { LayoutProps } from '@/types'
import { Stack } from '@mui/material'
import { Box } from '@mui/system'

export function MainLayout({ children }: LayoutProps) {
  return (
    <Stack direction="row" minHeight="100vh">
      <Sidebar />

      <Stack flexGrow={1} minHeight="100vh">
        <Header />

        <Box component="main" flexGrow={1}>
          {children}
        </Box>

        <Footer />
      </Stack>
    </Stack>
  )
}
