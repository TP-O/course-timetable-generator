import { AppContext } from '@/contexts'
import { LayoutProps } from '@/types/component'
import { Alert, Snackbar } from '@mui/material'
import { Fragment, useContext } from 'react'

export function CommonLayout({ children }: LayoutProps) {
  const app = useContext(AppContext)

  return (
    <Fragment>
      {children}

      {/* Global notification */}
      <Snackbar
        open={app.notification.isShowed}
        autoHideDuration={1000}
        onClose={app.closeNotification}
      >
        <Alert
          variant="filled"
          severity={app.notification.status}
          sx={{ width: '100%' }}
          onClose={app.closeNotification}
        >
          {app.notification.message}
        </Alert>
      </Snackbar>
    </Fragment>
  )
}
