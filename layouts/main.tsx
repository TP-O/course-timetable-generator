import { Footer, Header, Sidebar } from '@/components/common'
import { LayoutProps } from '@/types'
import { Stack } from '@mui/material'
import { Box } from '@mui/system'

export function MainLayout({ children }: LayoutProps) {
  return (
    <Stack minHeight="100vh">
      <Header />

      <Sidebar />

      <Box component="main" flexGrow={1}>
        {children}
      </Box>

      <Footer />
    </Stack>
  )
}
