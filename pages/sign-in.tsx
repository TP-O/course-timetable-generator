import { EmptyLayout } from '@/layouts'
import { NextPageWithLayout } from '@/types'
import { Facebook, GitHub, Google } from '@mui/icons-material'
import { Avatar, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import Link from 'next/link'

const Saved: NextPageWithLayout = () => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: {
          xs: 360,
          md: 448,
        },
        p: 5,
      }}
    >
      <Stack alignItems="center">
        <Avatar
          alt="ctg-logo"
          src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png"
          variant="square"
          sx={{ width: 28, height: 28 }}
        />

        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: 'center',
            pt: 2,
          }}
        >
          Sign in
        </Typography>

        <Typography
          variant="body1"
          component="span"
          sx={{
            textAlign: 'center',
            pt: 1,
          }}
        >
          Use your system account
        </Typography>
      </Stack>

      <Stack spacing={4} sx={{ pt: 3 }}>
        <TextField name="email" label="Email" placeholder="tpo@gmail.com" />

        <TextField name="password" label="Password" type="password" />

        <Stack direction="row" justifyContent="space-between">
          <Button sx={{ textTransform: 'none' }}>
            <Link href="/sign-up">Create account</Link>
          </Button>

          <Button variant="contained" sx={{ textTransform: 'none' }}>
            Let&apos;s go
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }}>Or</Divider>

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
    </Paper>
  )
}

Saved.Layout = EmptyLayout

export default Saved
