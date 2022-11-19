import { NotificationType } from '@/enums'
import { Notification } from '@/types'
import { createContext, ReactElement, useState } from 'react'

type AppContextType = {
  notification: Notification
  loading: boolean
  closeNotification: () => void
  showNotification: (setting: Omit<Notification, 'isShowed'>) => void
  load: () => void
  unload: () => void
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

export function AppProvider({ children }: { children: ReactElement }) {
  const [notification, setNotification] = useState<Notification>({
    isShowed: false,
    type: NotificationType.Snackbar,
    message: '',
    status: 'success',
  })
  const [loading, setLoading] = useState(false)

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

  function load() {
    setLoading(true)
  }

  function unload() {
    setLoading(false)
  }

  return (
    <AppContext.Provider
      value={{ notification, loading, load, unload, showNotification, closeNotification }}
    >
      {children}
    </AppContext.Provider>
  )
}
