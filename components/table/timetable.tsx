import { DayOfWeek, LocalStorageKey, NotificationType } from '@/enums'
import { TimetableType } from '@/types'
import {
  BookmarkAdd,
  BookmarkRemove,
  CenterFocusStrong,
  CopyAll,
  Download,
  Tune,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { Fragment, useContext, useEffect, useState } from 'react'
import html2canvas from 'html2canvas'
import { getDaysOfWeek } from '@/utils'
import { AppContext } from '@/contexts'
import _findIndex from 'lodash/findIndex.js'
import _isEqual from 'lodash/isEqual.js'
import { ListItem } from '@/types/component'
import DraggableList from '../list/draggable-list'
import { DropResult } from 'react-beautiful-dnd'

type TimetableTableProps = {
  key: number
  timetable: TimetableType
  onUnsaved: (key: number) => void
}

const daysOfWeek = getDaysOfWeek()

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

export function Timetable({ key, timetable, onUnsaved }: TimetableTableProps) {
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

  const { showNotification } = useContext(AppContext)

  // Copy and download timetable
  const [btnLoading, setBtnLoading] = useState(false)
  let [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  async function captureTimetable() {
    setBtnLoading(true)

    if (!canvas) {
      canvas = await html2canvas(document.querySelector(`#timetable-${key}`)!)
      setCanvas(canvas)
    }

    canvas?.toBlob((blob) => {
      const item = new ClipboardItem({ 'image/png': blob || '' })
      navigator.clipboard
        .write([item])
        .then(() =>
          showNotification({
            type: NotificationType.Snackbar,
            message: 'Captured timetable!',
            status: 'success',
          })
        )
        .catch(() =>
          showNotification({
            type: NotificationType.Snackbar,
            message: 'Unable to capture timetable :(',
            status: 'error',
          })
        )
    })

    setBtnLoading(false)
  }

  async function downloadTimetable() {
    setBtnLoading(true)

    if (!canvas) {
      canvas = await html2canvas(document.querySelector(`#timetable-${key}`)!)
      setCanvas(canvas)
    }

    const link = document.createElement('a')
    link.href = canvas.toDataURL()
    link.download = 'timetable'
    link.click()

    setBtnLoading(false)
  }

  // Copy course ID flags
  const [codeItems, setCodeItems] = useState<ListItem[]>([])
  const [openCodeList, setOpenCodeList] = useState(false)

  const handleOpenCodeList = () => {
    setOpenCodeList(true)
  }

  const handleCloseCodeList = () => {
    setOpenCodeList(false)
  }

  const onDragEnd = ({ destination, source }: DropResult) => {
    // dropped outside the list
    if (!destination) return

    const newItems = reorder(codeItems, source.index, destination.index)
    setCodeItems(newItems)
  }

  function copyFlags() {
    setBtnLoading(true)

    if (!codeItems.length) {
      showNotification({
        type: NotificationType.Snackbar,
        message: 'Nothing to copy :(',
        status: 'error',
      })
    } else {
      navigator.clipboard
        .writeText(`-I "${codeItems.map((i) => i.secondary).join('" -I "')}"`)
        .then(() =>
          showNotification({
            type: NotificationType.Snackbar,
            message: `Copied ID flags!`,
            status: 'success',
          })
        )
        .catch(() =>
          showNotification({
            type: NotificationType.Snackbar,
            message: 'Unable to copy :(',
            status: 'error',
          })
        )
    }

    setBtnLoading(false)
  }

  useEffect(() => {
    setCodeItems(() => {
      const codeItems: ListItem[] = []

      timetable.forEach((day) =>
        day.forEach((cls) => {
          if (cls.code && _findIndex(codeItems, (o) => o.primary === cls.name) === -1) {
            codeItems.push({
              primary: cls.name,
              secondary: cls.code,
            })
          }
        })
      )

      return codeItems
    })
  }, [timetable])

  // Save and unsave timetable
  const [saved, setSaved] = useState(false)

  function unsave() {
    setBtnLoading(true)

    const savedTimetables: TimetableType[] = JSON.parse(
      localStorage.getItem(LocalStorageKey.SavedTimetables) || '[]'
    )
    const removedIndex = _findIndex(savedTimetables, (o) => _isEqual(o, timetable))
    savedTimetables.splice(removedIndex, 1)
    localStorage.setItem(LocalStorageKey.SavedTimetables, JSON.stringify(savedTimetables))

    showNotification({
      type: NotificationType.Snackbar,
      message: `Unsaved timetable!`,
      status: 'success',
    })
    setSaved(false)
    onUnsaved(key)
    setBtnLoading(false)
  }

  function save() {
    setBtnLoading(true)

    const savedTimetables: TimetableType[] = JSON.parse(
      localStorage.getItem(LocalStorageKey.SavedTimetables) || '[]'
    )
    savedTimetables.push(timetable)
    localStorage.setItem(LocalStorageKey.SavedTimetables, JSON.stringify(savedTimetables))

    showNotification({
      type: NotificationType.Snackbar,
      message: `Saved timetable!`,
      status: 'success',
    })
    setSaved(true)
    setBtnLoading(false)
  }

  useEffect(() => {
    const savedTimetables: TimetableType[] = JSON.parse(
      localStorage.getItem(LocalStorageKey.SavedTimetables) || '[]'
    )
    setSaved(_findIndex(savedTimetables, (o) => _isEqual(o, timetable)) !== -1)
  }, [timetable])

  return (
    <Box sx={{ py: 2 }}>
      <Toolbar>
        <Tooltip title="Capture" placement="top">
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            disabled={btnLoading}
            data-timetable-id={`timetable-${key}`}
            sx={{ mr: 2 }}
            onClick={captureTimetable}
          >
            <CenterFocusStrong />
          </IconButton>
        </Tooltip>

        <Tooltip title="Download" placement="top">
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            disabled={btnLoading}
            sx={{ mr: 2 }}
            onClick={downloadTimetable}
          >
            <Download />
          </IconButton>
        </Tooltip>

        <Tooltip title={saved ? 'Unsave' : 'Save'} placement="top">
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            disabled={btnLoading}
            sx={{ mr: 2 }}
            onClick={saved ? unsave : save}
          >
            {saved ? <BookmarkRemove /> : <BookmarkAdd />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Copy ID" placement="top">
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            disabled={btnLoading}
            sx={{ mr: 2 }}
            onClick={handleOpenCodeList}
          >
            <CopyAll />
          </IconButton>
        </Tooltip>
      </Toolbar>

      <TableContainer component={Paper}>
        <Table
          id={`timetable-${key}`}
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
                      key={day}
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

      <Dialog
        open={openCodeList}
        onClose={handleCloseCodeList}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Drag/drop to change your course priority!!</DialogTitle>

        <DialogContent>
          <DraggableList items={codeItems} onDragEnd={onDragEnd} />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCodeList}>Close</Button>
          <Button
            autoFocus
            variant="contained"
            onClick={() => {
              handleCloseCodeList()
              copyFlags()
            }}
          >
            Copy ID
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
