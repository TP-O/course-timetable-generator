import { DayOfWeek, NotificationType } from '@/enums'
import { TimetableType } from '@/types'
import { CenterFocusStrong, Download } from '@mui/icons-material'
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
import { Fragment, MouseEvent, useContext, useEffect, useState } from 'react'
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

  // Copy and download timetable
  const app = useContext(AppContext)
  let [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  async function captureTimetable() {
    if (!canvas) {
      canvas = await html2canvas(document.querySelector(`#timetable-${id}`)!)
      setCanvas(canvas)
    }

    canvas?.toBlob((blob) => {
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

  async function downloadTimetable(event: MouseEvent<HTMLElement>) {
    if (!canvas) {
      canvas = await html2canvas(document.querySelector(`#timetable-${id}`)!)
      setCanvas(canvas)
    }

    const link = document.createElement('a')
    link.href = canvas.toDataURL()
    link.download = 'timetable'
    link.click()
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

        <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
          onClick={downloadTimetable}
        >
          <Download />
        </IconButton>
      </Toolbar>

      <TableContainer component={Paper}>
        <Table
          id={`timetable-${id}`}
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

          <TableBody sx={{ backgroundColor: 'white' }}>
            {[...Array(16)].map((_, row) => (
              <TableRow key={row} sx={{ width: '14%' }}>
                {daysOfWeek.map((day, i) => {
                  if (!isValidCell(i, row + 1)) {
                    return null
                  }

                  const cls = getClass(i, row + 1)

                  return cls ? (
                    <Tooltip
                      key={day}
                      title={
                        <Fragment>
                          <Typography color="inherit" sx={{ mb: 0.5 }}>
                            <b>Name:</b> {cls.name}
                          </Typography>
                          <Typography color="inherit" sx={{ mb: 0.5 }}>
                            <b>Room:</b> {cls.room}
                          </Typography>
                          <Typography color="inherit" sx={{ mb: 0.5 }}>
                            <b>Duration:</b> {cls.begin} &ndash; {cls.begin + cls.periods - 1}
                          </Typography>
                          <Typography color="inherit" sx={{ mb: 0.5 }}>
                            <b>Lecturers:</b> {cls.lecturers.join(', ')}
                          </Typography>
                        </Fragment>
                      }
                      disableHoverListener={!cls}
                    >
                      <TableCell
                        rowSpan={cls.periods}
                        sx={{
                          py: 2,
                          backgroundColor: cls.color,
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
                          {cls.name}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                          {cls.room}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                          {cls.lecturers}
                        </Typography>
                      </TableCell>
                    </Tooltip>
                  ) : (
                    <TableCell
                      rowSpan={1}
                      sx={{
                        py: 2,
                        backgroundColor: 'transparent',
                      }}
                    />
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
