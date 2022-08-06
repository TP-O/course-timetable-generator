import { SidebarMenuItem } from '@/types'
import {
  AddCircle,
  ArrowBackIos,
  BarChart,
  Bookmark,
  GitHub,
  TableView,
  Terminal,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Drawer,
  Link,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
  Typography,
} from '@mui/material'
import NextLink from 'next/link'
import { useState } from 'react'

export function Sidebar() {
  const [state, setState] = useState(true)

  function toggle(open: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }

      setState(open)
    }
  }

  const menuItems: SidebarMenuItem[] = [
    {
      title: 'Generation',
      href: '/generation',
      Icon: AddCircle,
    },
    {
      title: 'Analytics',
      href: '/analytics',
      Icon: BarChart,
    },
    {
      title: 'Saved',
      href: '/saved',
      Icon: Bookmark,
    },
    {
      title: 'Tools',
      href: '/tools',
      Icon: Terminal,
    },
  ]

  return (
    <Drawer anchor="left" open={state} onClose={toggle(false)}>
      <Stack
        sx={{
          width: 256,
          minHeight: '100vh',
          backgroundColor: 'sidebar.background',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            height: 48,
            px: 2.5,
          }}
        >
          <Avatar
            alt="ctg-logo"
            src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png"
            variant="square"
            sx={{ width: 28, height: 28 }}
          />

          <Typography
            variant="h6"
            component="h1"
            sx={{ color: 'sidebar.header', fontWeight: 500, pt: 0.5 }}
          >
            CT Generator
          </Typography>
        </Stack>

        <Divider sx={{ borderColor: 'sidebar.divider' }} />

        <Box
          sx={{
            flexGrow: 1,
            backgroundImage:
              'url("https://www.gstatic.com/mobilesdk/190424_mobilesdk/nav_nachos@2x.png")',
          }}
        >
          <NextLink href="/">
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
                height: 56,
                px: 2.5,
                cursor: 'pointer',
                ':hover': {
                  backgroundColor: 'sidebar.hoveringWrapperBackground',
                },
              }}
            >
              <TableView fontSize="medium" sx={{ color: 'sidebar.itemTitle' }} />

              <Typography
                variant="subtitle2"
                component="div"
                sx={{ flexGrow: 1, color: 'sidebar.itemTitle' }}
              >
                Course Timetable
              </Typography>
            </Stack>
          </NextLink>

          <Divider sx={{ borderColor: 'sidebar.divider' }} />

          <Box sx={{ px: 3, pt: 2.25, pb: 2.5 }}>
            <Typography variant="caption" component="div" sx={{ color: 'sidebar.listHeader' }}>
              Categories
            </Typography>
          </Box>

          <MenuList sx={{ color: 'sidebar.itemTitle', px: 1.25, py: 0 }}>
            {menuItems.map((item, i) => (
              <NextLink href={item.href} key={i}>
                <MenuItem
                  sx={{
                    px: 1.25,
                    py: 1.75,
                    mb: 0.25,
                    backgroundColor: 'sidebar.wrapperBackground',
                    ':hover': {
                      color: 'sidebar.hoveringItemTitle',
                      backgroundColor: 'sidebar.hoveringWrapperBackground',
                      '.MuiSvgIcon-root': {
                        color: 'sidebar.hoveringItemTitle',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <item.Icon fontSize="medium" sx={{ color: 'sidebar.itemTitle' }} />
                  </ListItemIcon>

                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant="body2" component="span" fontWeight={500}>
                        {item.title}
                      </Typography>
                    }
                  />
                </MenuItem>
              </NextLink>
            ))}
          </MenuList>

          <Card
            sx={{
              maxWidth: 345,
              mx: 1.25,
              my: 3.5,
              backgroundColor: 'sidebar.wrapperBackground',
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  color: 'sidebar.header',
                  fontWeight: 500,
                  mb: 1.5,
                }}
              >
                Lizard
              </Typography>

              <Typography
                component="div"
                color="sidebar.notificationContent"
                sx={{ fontSize: 13, fontWeight: 500, lineHeight: '20px' }}
              >
                Lizards are a widespread group of squamate reptiles, with over 6,000 species,
                ranging across all continents except Antarctica
              </Typography>
            </CardContent>

            <CardActions>
              <Button size="small" sx={{ color: 'sidebar.notificationButton' }}>
                Contribute
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            height: 44,
            pl: 3,
          }}
        >
          <Link
            href="https://github.com/utpop/course-timetable-generator"
            target="_blank"
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1,
              ':hover': {
                backgroundColor: 'sidebar.hoveringWrapperBackground',
                '.MuiSvgIcon-root': {
                  color: 'sidebar.hoveringItemTitle',
                },
              },
            }}
          >
            <GitHub fontSize="small" sx={{ color: 'sidebar.itemTitle' }} />
          </Link>

          <Button
            sx={{
              flexGrow: 1,
              justifyContent: 'end',
              px: 3,
              py: 1.25,
              ':hover': {
                backgroundColor: 'sidebar.hoveringWrapperBackground',
                '.MuiSvgIcon-root': {
                  color: 'sidebar.hoveringItemTitle',
                },
              },
            }}
            onClick={toggle(false)}
          >
            <ArrowBackIos fontSize="small" sx={{ color: 'sidebar.itemTitle' }} />
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  )
}
