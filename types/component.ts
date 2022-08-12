import { AlertColor } from '@mui/material'
import { SvgIconComponent } from '@mui/icons-material'

export type AlertState = {
  message: string
  status: AlertColor
  isOpen: boolean
}

export type ScrollData<T> = {
  hidden: T[]
  displayed: T[]
}

export type SidebarMenuItem = {
  title: string
  href: string
  Icon: SvgIconComponent
}
