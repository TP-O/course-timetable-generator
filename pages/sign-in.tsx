import { useAuth } from '@/hooks'
import { EmptyLayout } from '@/layouts'
import { NextPageWithLayout, SignInPayload } from '@/types'
import { Facebook, GitHub, Google } from '@mui/icons-material'
import { Alert, Avatar, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

const Saved: NextPageWithLayout = () => {
  const router = useRouter()
  const { signIn } = useAuth()
  const [error, setError] = useState('')
  const [payload, setPayload] = useState<SignInPayload>({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  function handleSignIn(event: FormEvent) {
    event.preventDefault()

    setError('')
    setLoading(true)

    signIn(payload)
      .then(() => router.push('/timetable'))
      .catch(() => setError('Email or password are incorrect!'))
      .finally(() => setLoading(false))
  }

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

      <Stack spacing={4} sx={{ pt: 3 }} component="form" onSubmit={handleSignIn}>
        <TextField
          name="email"
          label="Email"
          type="email"
          required
          placeholder="tpo@gmail.com"
          onChange={(event) =>
            setPayload((payload) => ({
              ...payload,
              email: event.target.value,
            }))
          }
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          required
          onChange={(event) =>
            setPayload((payload) => ({
              ...payload,
              password: event.target.value,
            }))
          }
        />

        {error !== '' && <Alert severity="error">{error}</Alert>}

        <Stack direction="row" justifyContent="space-between">
          <Button tabIndex={-1} sx={{ textTransform: 'none' }}>
            <Link href="/sign-up">
              <span>Create account</span>
            </Link>
          </Button>

          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
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
