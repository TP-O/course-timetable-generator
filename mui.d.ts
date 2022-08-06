import * as materialStyles from '@mui/material/styles'
import { UrlWithStringQuery } from 'url'

type SidebarPalette = {
  background: string
  wrapperBackground: string
  hoveringWrapperBackground: string
  header: string
  divider: string
  listHeader: string
  itemTitle: string
  hoveringItemTitle: string
  selectedItemTitle: string
  notificationContent: string
  notificationButton: string
}

declare module '@mui/material/styles' {
  interface Palette {
    sidebar?: SidebarPalette
  }

  interface PaletteOptions {
    sidebar?: SidebarPalette
  }
}
