import { Facebook, GitHub, Google } from '@mui/icons-material'
import { Button, Stack } from '@mui/material'

export function OAuthList() {
  return (
    <Stack direction="row" justifyContent="space-around">
      <Button variant="outlined">
        <Google />
      </Button>

      <Button variant="outlined">
        <Facebook />
      </Button>

      <Button variant="outlined">
        <GitHub />
      </Button>
    </Stack>
  )
}
