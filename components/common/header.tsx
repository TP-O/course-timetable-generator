import { useAuth } from '@/hooks'
import { AccountCircle } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export function Header() {
  // App bar title
  const router = useRouter()
  const [appBarTitle, setAppBarTitle] = useState('App Bar')

  useEffect(() => {
    const title = router.pathname.substring(1)

    setAppBarTitle(title)
  }, [router.pathname])

  // Auth
  const { user, signOut } = useAuth()

  // Menu app bar
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  function handleMenu(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleCloseMenu() {
    setAnchorEl(null)
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'appBar.background' }}>
      <Toolbar variant="dense">
        <Typography
          variant="body2"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 500,
            color: 'appBar.text',
            textTransform: 'capitalize',
          }}
        >
          {appBarTitle}
        </Typography>

        {user === null ? (
          <Stack direction="row" spacing={3}>
            <Link href="/sign-in">
              <Button
                variant="text"
                sx={{
                  fontSize: 14,
                  color: 'appBar.text',
                  textTransform: 'capitalize',
                  ':hover': {
                    color: 'appBar.hoveringText',
                  },
                }}
              >
                Sign in
              </Button>
            </Link>

            <Link href="/sign-up">
              <Button
                variant="outlined"
                sx={{
                  fontSize: 14,
                  color: 'appBar.text',
                  textTransform: 'capitalize',
                  borderColor: 'appBar.text',
                  ':hover': {
                    color: 'appBar.hoveringText',
                    borderColor: 'appBar.hoveringText',
                  },
                }}
              >
                Sign up
              </Button>
            </Link>
          </Stack>
        ) : (
          <Box>
            <IconButton
              size="large"
              onClick={handleMenu}
              sx={{
                color: 'appBar.text',
              }}
            >
              <AccountCircle />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={signOut}>Sign-out</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
