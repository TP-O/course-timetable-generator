import { LayoutProps } from '@/types'
import { Stack } from '@mui/material'

export function EmptyLayout({ children }: LayoutProps) {
  return (
    <Stack
      sx={{
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Stack>
  )
}
