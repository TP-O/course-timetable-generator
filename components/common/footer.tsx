import { Stack, Typography } from '@mui/material'

export function Footer() {
  const year = new Date().getFullYear()
  const owner = 'tranphong'

  return (
    <Stack component="footer" sx={{ alignItems: 'center', py: 0.5 }}>
      <Typography variant="caption" component="span">
        Copyright &copy; {year} {owner}
      </Typography>
    </Stack>
  )
}
