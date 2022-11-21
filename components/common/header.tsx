import { useAuth } from '@/hooks'
import { AccountCircle, Help } from '@mui/icons-material'
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
import { Fragment, useContext, useEffect, useState } from 'react'
import IntroJs, { Step } from 'intro.js'
import { NotificationType, Path } from '@/enums'
import { AppContext } from '@/contexts'

export function Header() {
  // App bar title
  const router = useRouter()
  const [appBarTitle, setAppBarTitle] = useState('App Bar')

  useEffect(() => {
    const title = router.pathname.slice(1)

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

  // Guideline
  const { showNotification } = useContext(AppContext)

  function guide() {
    const steps: Step[] = []
    const guidableEls = document.querySelectorAll('[data-intro]') as NodeListOf<HTMLElement>

    if (!guidableEls.length) {
      showNotification({
        type: NotificationType.Dialog,
        message: 'Nothing to help here :D',
        status: 'info',
      })

      return
    }

    guidableEls.forEach((el) => {
      if (el.dataset.intro) {
        steps.push({
          element: el,
          title: el.dataset.title,
          intro: el.dataset.intro!,
          disableInteraction: true,
        })
      }
    })

    steps.push({
      intro: `<img style="width: 100%" src="${Path.PepeDancing}" />`,
    })

    IntroJs().addSteps(steps).start()
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
            pl: {
              xs: 5,
              md: 0,
            },
          }}
        >
          {appBarTitle}
        </Typography>

        <Stack direction="row" spacing={3}>
          {user ? (
            <Fragment>
              <IconButton
                size="large"
                // order="1"
                sx={{
                  color: 'appBar.text',
                  p: 0.5,
                }}
                onClick={handleMenu}
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
            </Fragment>
          ) : (
            <Fragment>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
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
              </Box>

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
            </Fragment>
          )}

          <IconButton
            id="guide-btn"
            size="large"
            sx={{
              color: 'appBar.text',
              p: 0.5,
            }}
            onClick={guide}
          >
            <Help />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
