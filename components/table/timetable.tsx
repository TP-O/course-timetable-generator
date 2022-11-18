import { DayOfWeek, NotificationType } from '@/enums'
import { TimetableType } from '@/types'
import { CenterFocusStrong } from '@mui/icons-material'
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { Fragment, MouseEvent, useContext } from 'react'
import html2canvas from 'html2canvas'
import { getDaysOfWeek } from '@/utils'
import { AppContext } from '@/contexts'

type TimetableTableProps = {
  id: number | string
  timetable: TimetableType
}

const daysOfWeek = getDaysOfWeek()

export function Timetable({ id, timetable }: TimetableTableProps) {
  function getClass(day: DayOfWeek, begin: number) {
    for (const classs of timetable[day]) {
      if (classs.begin === begin) {
        return classs
      }
    }

    return undefined
  }

  // Check if the cell is presented
  function isValidCell(day: DayOfWeek, begin: number) {
    if (day === DayOfWeek.Unknown) {
      return false
    }

    for (const classs of timetable[day]) {
      if (classs.begin < begin && classs.begin + classs.periods > begin) {
        return false
      }
    }

    return true
  }

  // Store timetable image into clipboard
  const app = useContext(AppContext)

  function captureTimetable(event: MouseEvent<HTMLElement>) {
    html2canvas(document.querySelector(`#${event.currentTarget.dataset.timetableId}`)!).then(
      (canvas) => {
        canvas.toBlob((blob) => {
          const item = new ClipboardItem({ 'image/png': blob || '' })
          navigator.clipboard
            .write([item])
            .then(() =>
              app.showNotification({
                type: NotificationType.Snackbar,
                message: 'Captured timetable!',
                status: 'success',
              })
            )
            .catch(() =>
              app.showNotification({
                type: NotificationType.Snackbar,
                message: 'Unable to capture timetable :(',
                status: 'error',
              })
            )
        })
      }
    )
  }

  return (
    <Box sx={{ py: 2 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          data-timetable-id={`timetable-${id}`}
          sx={{ mr: 2 }}
          onClick={captureTimetable}
        >
          <CenterFocusStrong />
        </IconButton>
      </Toolbar>

      <TableContainer id={`timetable-${id}`} component={Paper}>
        <Table
          size="small"
          sx={{
            minWidth: 650,
            mx: 'auto',
            'th,td': {
              textAlign: 'center',
              borderLeft: '1px solid rgba(224, 224, 224, 1)',
            },
          }}
        >
          <TableHead>
            <TableRow>
              {daysOfWeek.map((day) => (
                <TableCell
                  key={day}
                  sx={{
                    width: `${100 / 7}%`,
                    color: 'table.headerText',
                    backgroundColor: 'table.headerBackground',
                  }}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {[...Array(16)].map((_, row) => (
              <TableRow key={row} sx={{ width: '14%' }}>
                {daysOfWeek.map((day, i) => {
                  if (!isValidCell(i, row + 1)) {
                    return null
                  }

                  const cls = getClass(i, row + 1)

                  return (
                    <Tooltip
                      key={day}
                      title={
                        <Fragment>
                          <Typography color="inherit" sx={{ mb: 0.5 }}>
                            <b>Name:</b> {cls?.name}
                          </Typography>
                          <Typography color="inherit" sx={{ mb: 0.5 }}>
                            <b>Room:</b> {cls?.room}
                          </Typography>
                          <Typography color="inherit" sx={{ mb: 0.5 }}>
                            <b>Lecturers:</b> {cls?.lecturers.join(', ')}
                          </Typography>
                        </Fragment>
                      }
                      disableHoverListener={!cls}
                    >
                      <TableCell
                        rowSpan={cls?.periods || 1}
                        sx={{
                          py: 2,
                          backgroundColor: cls?.color || 'transparent',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                          }}
                        >
                          {cls?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                          {cls?.room}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                          {cls?.lecturers}
                        </Typography>
                      </TableCell>
                    </Tooltip>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
