import { Url } from '@/enums'
import { SidebarMenuItem } from '@/types'
import {
  AddCircle,
  ArrowBackIos,
  ArrowForwardIos,
  BarChart,
  Bookmark,
  GitHub,
  Menu,
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
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'

export function Sidebar() {
  // Menu data
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

  // Sidebar displayment
  const maxWidthToUseDrawer = 918
  const [useDrawer, setUseDrawer] = useState(true)

  useEffect(() => {
    if (window.innerWidth > maxWidthToUseDrawer) {
      setUseDrawer(false)
    }
  }, [])

  if (typeof window !== 'undefined') {
    window.onresize = () => {
      if (!useDrawer && window.innerWidth <= maxWidthToUseDrawer) {
        setUseDrawer(true)
        setShowSidebar(false)
      }

      if (useDrawer && window.innerWidth > maxWidthToUseDrawer) {
        setUseDrawer(false)
        setShowSidebar(true)
      }
    }
  }

  // Toggle sidebar
  const [showSidebar, setShowSidebar] = useState(() =>
    // Show sidebar if screen is large enough
    typeof window === 'undefined' ? false : window.innerWidth > maxWidthToUseDrawer
  )

  function toggle(show: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }

      setShowSidebar(show)
    }
  }

  const Sidebar = () => (
    <Stack
      sx={{
        width: 256,
        minHeight: '100vh',
        backgroundColor: 'sidebar.background',
        transition: 'width',
      }}
    >
      <NextLink href="/">
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            height: 48,
            px: 2.5,
            cursor: 'pointer',
          }}
        >
          <Avatar
            alt="ctg-logo"
            src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png"
            variant="square"
            sx={{ width: 28, height: 28 }}
          />

          {showSidebar && (
            <Typography
              variant="h6"
              component="h1"
              sx={{ color: 'sidebar.header', fontWeight: 500, pt: 0.5 }}
            >
              CT Generator
            </Typography>
          )}
        </Stack>
      </NextLink>

      <Divider sx={{ borderColor: 'sidebar.divider' }} />

      <Box
        sx={{
          flexGrow: showSidebar ? 1 : 0,
          backgroundImage:
            'url("https://www.gstatic.com/mobilesdk/190424_mobilesdk/nav_nachos@2x.png")',
        }}
      >
        <NextLink href={Url.Main}>
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

            {showSidebar && (
              <Typography
                variant="subtitle2"
                component="div"
                sx={{ flexGrow: 1, color: 'sidebar.itemTitle' }}
              >
                Course Filter
              </Typography>
            )}
          </Stack>
        </NextLink>

        <Divider sx={{ borderColor: 'sidebar.divider' }} />

        {showSidebar && (
          <Box sx={{ px: 3, pt: 2.25, pb: 2.5 }}>
            <Typography variant="caption" component="div" sx={{ color: 'sidebar.listHeader' }}>
              Categories
            </Typography>
          </Box>
        )}

        <MenuList
          sx={{
            color: 'sidebar.itemTitle',
            px: showSidebar ? 1.25 : 0,
            py: 0,
          }}
        >
          {menuItems.map((item, i) => (
            <NextLink href={item.href} key={i}>
              <MenuItem
                sx={{
                  px: showSidebar ? 1.25 : 2.5,
                  py: 1.75,
                  mb: 0.25,
                  backgroundColor: showSidebar ? 'sidebar.wrapperBackground' : 'transparent',
                  borderTopRightRadius: i === 0 ? 8 : 0,
                  borderTopLeftRadius: i === 0 ? 8 : 0,
                  borderBottomLeftRadius: i === menuItems.length - 1 ? 8 : 0,
                  borderBottomRightRadius: i === menuItems.length - 1 ? 8 : 0,
                  transition: 'background-color',
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

                {showSidebar && (
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant="body2" component="span" fontWeight={500}>
                        {item.title}
                      </Typography>
                    }
                  />
                )}
              </MenuItem>
            </NextLink>
          ))}
        </MenuList>

        {showSidebar && (
          <Card
            sx={{
              maxWidth: 345,
              mx: 1.25,
              my: 3.5,
              backgroundColor: 'sidebar.wrapperBackground',
              borderRadius: '8px',
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
        )}
      </Box>

      <Stack direction={showSidebar ? 'row' : 'column'} height={showSidebar ? 44 : 125}>
        <Link
          href="https://github.com/utpop/course-timetable-generator"
          target="_blank"
          sx={{
            display: 'flex',
            flexGrow: showSidebar ? 0 : 1,
            alignItems: 'center',
            px: 2.5,
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

        {!showSidebar && <Divider sx={{ borderColor: 'sidebar.divider' }} />}

        <Button
          sx={{
            flexGrow: 1,
            justifyContent: showSidebar ? 'end' : 'start',
            px: 2.5,
            py: 1.25,
            ':hover': {
              backgroundColor: 'sidebar.hoveringWrapperBackground',
              '.MuiSvgIcon-root': {
                color: 'sidebar.hoveringItemTitle',
              },
            },
          }}
          onClick={showSidebar ? toggle(false) : toggle(true)}
        >
          {showSidebar ? (
            <ArrowBackIos fontSize="small" sx={{ color: 'sidebar.itemTitle' }} />
          ) : (
            <ArrowForwardIos fontSize="small" sx={{ color: 'sidebar.itemTitle' }} />
          )}
        </Button>
      </Stack>
    </Stack>
  )

  return !useDrawer ? (
    <Collapse
      orientation="horizontal"
      in={showSidebar}
      collapsedSize={68}
      sx={{
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <Sidebar />
    </Collapse>
  ) : (
    <Box>
      <Box
        sx={{
          position: 'fixed',
          top: '10%',
          left: 0,
          backgroundColor: 'sidebar.background',
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <IconButton sx={{ py: 0 }} onClick={toggle(true)}>
          <Menu sx={{ color: 'sidebar.itemTitle' }} />
        </IconButton>
      </Box>

      <Drawer
        anchor="left"
        open={showSidebar}
        ModalProps={{
          keepMounted: true,
        }}
        onClose={toggle(false)}
      >
        <Sidebar />
      </Drawer>
    </Box>
  )
}
