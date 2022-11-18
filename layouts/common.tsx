import { AppContext } from '@/contexts'
import { NotificationType } from '@/enums'
import { LayoutProps } from '@/types/component'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material'
import { Fragment, useContext } from 'react'

export function CommonLayout({ children }: LayoutProps) {
  const { notification, closeNotification } = useContext(AppContext)

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
    </Fragment>
  )
}
