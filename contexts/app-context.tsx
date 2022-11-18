import { NotificationType } from '@/enums'
import { Notification } from '@/types'
import { createContext, ReactElement, useState } from 'react'

type AppContextType = {
  notification: Notification
  closeNotification: () => void
  showNotification: (setting: Omit<Notification, 'isShowed'>) => void
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

export function AppProvider({ children }: { children: ReactElement }) {
  const [notification, setNotification] = useState<Notification>({
    isShowed: false,
    type: NotificationType.Snackbar,
    message: '',
    status: 'success',
  })

  function closeNotification() {
    setNotification((notification) => ({
      ...notification,
      isShowed: false,
    }))
  }

  function showNotification(setting: Omit<Notification, 'isShowed'>) {
    setNotification(() => ({
      isShowed: true,
      ...setting,
    }))
  }

  return (
    <AppContext.Provider value={{ notification, showNotification, closeNotification }}>
      {children}
    </AppContext.Provider>
  )
}
