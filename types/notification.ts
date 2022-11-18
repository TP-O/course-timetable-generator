import { NotificationType } from '@/enums'
import { AlertColor } from '@mui/material'

export type Notification = {
  type: NotificationType
  title?: string
  message: string
  status: AlertColor
  isShowed: boolean
}
