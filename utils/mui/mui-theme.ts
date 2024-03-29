import { createTheme } from '@mui/material/styles'
import { green, red } from '@mui/material/colors'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1967d2',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red[600],
    },
    success: {
      main: green[600],
    },
    sidebar: {
      background: '#051e34',
      wrapperBackground: 'rgba(71, 98, 130, 0.2)',
      hoveringWrapperBackground: 'rgba(71,98,130,.4)',
      header: '#ffffff',
      divider: 'rgba(255, 255, 255, 0.1)',
      listHeader: 'rgba(255, 255, 255, 0.5)',
      itemTitle: 'rgba(255, 255, 255, 0.8)',
      activeItemTitle: '#669df6',
      hoveringItemTitle: 'rgba(255, 255, 255)',
      selectedItemTitle: '#669df6',
      notificationContent: 'rgba(255, 255, 255, 0.7)',
      notificationButton: '#669df6',
    },
    appBar: {
      background: '#1a73e8',
      text: 'rgb(255, 255, 255)',
      hoveringText: 'rgba(255, 255, 255, 0.8)',
    },
    table: {
      headerBackground: '#051e34',
      headerText: '#ffffff',
    },
  },
  components: {
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          '&:hover': {
            color: '#ffffff',
          },

          '&.Mui-active': {
            color: '#ffffff',
          },
        },
        icon: {
          color: 'inherit !important',
        },
      },
    },
  },
})
