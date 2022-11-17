import { Notification } from '@/types'
import { AlertColor } from '@mui/material'
import { createContext, ReactElement, useState } from 'react'

type AppContextType = {
  notification: Notification
  closeNotification: () => void
  showNotification: (message: string, status: AlertColor) => void
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

export function AppProvider({ children }: { children: ReactElement }) {
  const [notification, setNotification] = useState<Notification>({
    isShowed: false,
    message: '',
    status: 'success',
  })

  function closeNotification() {
    setNotification((notification) => ({
      ...notification,
      isShowed: false,
    }))
  }

  function showNotification(message: string, status: AlertColor) {
    setNotification(() => ({
      isShowed: true,
      status,
      message,
    }))
  }

  return (
    <AppContext.Provider value={{ notification, showNotification, closeNotification }}>
      {children}
    </AppContext.Provider>
  )
}
