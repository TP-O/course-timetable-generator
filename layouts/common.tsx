import { AppContext } from '@/contexts'
import { NotificationType, Path } from '@/enums'
import { LayoutProps } from '@/types/component'
import {
  Alert,
  Avatar,
  Backdrop,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { Fragment, useContext } from 'react'

export function CommonLayout({ children }: LayoutProps) {
  const { notification, loading, loadingText, closeNotification } = useContext(AppContext)

  return (
    <Fragment>
      {children}

      {/* Global notification */}
      {notification.type === NotificationType.Snackbar ? (
        <Snackbar open={notification.isShowed} autoHideDuration={2500} onClose={closeNotification}>
          <Alert
            variant="filled"
            severity={notification.status}
            sx={{ width: '100%' }}
            onClose={closeNotification}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ) : (
        <Dialog open={notification.isShowed} onClose={closeNotification}>
          <DialogTitle>{notification.title ?? 'Focus!!!'}</DialogTitle>

          <DialogContent sx={{ minWidth: 350 }}>
            <DialogContentText>{notification.message}</DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button variant="contained" onClick={closeNotification} autoFocus>
              Oke
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <Stack>
          <Avatar
            alt="welcome"
            src={Path.PepeWaiting2}
            variant="square"
            sx={{ width: 224, height: 224, mb: 4, mx: 'auto' }}
          />

          <Typography variant="h6" sx={{ fontWeight: 500, textAlign: 'center' }}>
            {loadingText ? loadingText : 'Wait...'}
          </Typography>
        </Stack>
      </Backdrop>
    </Fragment>
  )
}
