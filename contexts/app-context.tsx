import { NotificationType } from '@/enums'
import { Notification } from '@/types'
import { createContext, ReactElement, useState } from 'react'

type AppContextType = {
  notification: Notification
  loading: boolean
  loadingText: string
  closeNotification: () => void
  showNotification: (setting: Omit<Notification, 'isShowed'>) => void
  load: (text?: string) => void
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
  const [loadingText, setLoadingText] = useState('')

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

  function load(text?: string) {
    setLoadingText(text || '')
    setLoading(true)
  }

  function unload() {
    setLoading(false)
  }

  return (
    <AppContext.Provider
      value={{
        notification,
        loading,
        loadingText,
        load,
        unload,
        showNotification,
        closeNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
