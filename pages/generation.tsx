import { DayOfWeek, Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import {
  generateTimetables,
  getCourseGroups,
  getCourseNames,
  getFaculties,
  getLecturersOfCourse,
  getUniversities,
} from '@/services'
import { AlertState, NextPageWithLayout, ScrollData, Timetable, TimetableFilter } from '@/types'
import { convertDayNumberToDayString } from '@/utils'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { ChangeEvent, Fragment, MouseEvent, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import html2canvas from 'html2canvas'
import { CenterFocusStrong, Cancel } from '@mui/icons-material'

const universities = getUniversities()
const daysOfWeek = Object.keys(DayOfWeek).filter(
  (value) => value !== 'Unknown' && isNaN(Number(value))
)

const Generation: NextPageWithLayout = () => {
  // Course searching
  const [enteredCoureNames, setEnteredCourseNames] = useState<String[]>([])
  const [courseBatchFilter, setCourseBatchFilter] = useState({
    university: Univerisity.HCMIU,
    faculty: '',
  })
  const [avaliableFaculties, setAvailableFaculties] = useState<string[]>([])
  const [availableCourseNames, setAvailableCourseNames] = useState<String[]>([])

  function handleEnteredCourseNames(_: any, value: String[]) {
    setEnteredCourseNames(value)
  }

  function handleCourseBatchFilter(event: SelectChangeEvent) {
    setCourseBatchFilter((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }))
  }

  useEffect(() => {
    getFaculties(courseBatchFilter.university).then((faculties) => setAvailableFaculties(faculties))
  }, [courseBatchFilter.university])

  useEffect(() => {
    getCourseNames(courseBatchFilter.university, courseBatchFilter.faculty).then((courseNames) =>
      setAvailableCourseNames(courseNames)
    )
  }, [courseBatchFilter])

  // Timetable filter
  const [timetableFilter, setTimetableFilter] = useState<TimetableFilter>({
    dayOff: {
      days: 1,
      specificDays: [DayOfWeek.Sun],
    },
    lecturer: {},
  })
  const [lecturersOfCourses, setLecturersOfCourses] = useState<
    Record<string, Record<string, string[]>>
  >({})

  function handleChangeDayOffFilter(
    event: SelectChangeEvent<DayOfWeek[]> | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setTimetableFilter((state) => {
      const newState = { ...state }

      if (event.target.name === 'days' && typeof event.target.value === 'number') {
        newState.dayOff!.days = event.target.value
      } else if (event.target.name === 'specificDays' && Array.isArray(event.target.value)) {
        newState.dayOff!.specificDays = event.target.value
      }

      return newState
    })
  }

  function handleChangeLecturerFilter(courseName: string) {
    return (event: SelectChangeEvent<string[]>) => {
      setTimetableFilter((state) => {
        const newState = { ...state }

        if (event.target.name === 'expectations') {
          newState.lecturer![courseName]!.expectations = Array.from(event.target.value)
        } else if (event.target.name === 'unexpectations') {
          newState.lecturer![courseName]!.unexpectations = Array.from(event.target.value)
        }

        return newState
      })
    }
  }

  useEffect(() => {
    // Update lecturer filter
    setTimetableFilter((state) => {
      const newState = { ...state }
      const oldCourseNames = Object.keys(newState.lecturer!)

      // Add new courses
      enteredCoureNames.forEach((name) => {
        if (!oldCourseNames.includes(String(name))) {
          newState.lecturer![String(name)] = {
            expectations: [],
            unexpectations: [],
          }

          // Get lecturers for new course
          getLecturersOfCourse(courseBatchFilter.university, String(name)).then((lecturers) =>
            setLecturersOfCourses((state) => {
              const newState = { ...state }

              if (!newState[courseBatchFilter.university]) {
                newState[courseBatchFilter.university] = {}
              }

              if (!newState[courseBatchFilter.university][String(name)]) {
                newState[courseBatchFilter.university][String(name)] = lecturers
              }

              return newState
            })
          )
        }
      })

      // Remove courses
      oldCourseNames.forEach((name) => {
        if (!enteredCoureNames.includes(name)) {
          delete newState.lecturer![name]
        }
      })

      return newState
    })
  }, [courseBatchFilter.university, enteredCoureNames])

  // Generate timetables
  const [timetables, setTimetables] = useState<ScrollData<Timetable>>({
    hidden: [],
    displayed: [],
  })

  async function handleGenerateTimetable() {
    const courseGroups = await getCourseGroups(
      courseBatchFilter.university,
      enteredCoureNames as string[]
    )
    const timetables = generateTimetables(courseGroups, timetableFilter)

    setTimetables({
      hidden: timetables,
      displayed: timetables.splice(0, 10),
    })
  }

  function loadMoreTimetable() {
    const size = 5

    setTimetables((state) => {
      const displayed = [...state.displayed, ...state.hidden.splice(0, size)]

      return { ...state, displayed }
    })
  }

  function getClass(timetable: Timetable, day: DayOfWeek, begin: number) {
    for (const classs of timetable[day]) {
      if (classs.begin === begin) {
        return classs
      }
    }

    return undefined
  }

  function isValidCell(timetable: Timetable, day: DayOfWeek, begin: number) {
    if (day === DayOfWeek.Unknown) {
      return false
    }

    for (const classs of timetable[day]) {
      if (classs.begin < begin && classs.begin + classs.periods - 1 >= begin) {
        return false
      }
    }

    return true
  }

  // Capture timetable
  const [snackbarState, setSnackbarState] = useState<AlertState>({
    message: '',
    status: 'success',
    isOpen: false,
  })

  function handleCloseSnackbar() {
    setSnackbarState((state) => ({ ...state, isOpen: false }))
  }

  function handleShowSnackbar(message: string, success = true) {
    setSnackbarState({
      message,
      status: success ? 'success' : 'error',
      isOpen: true,
    })
  }

  function captureTimetable(event: MouseEvent<HTMLElement>) {
    html2canvas(document.querySelector(`#${event.currentTarget.dataset.timetableId}`)!).then(
      (canvas) => {
        canvas.toBlob((blob) => {
          const item = new ClipboardItem({ 'image/png': blob || '' })
          navigator.clipboard
            .write([item])
            .then(() => handleShowSnackbar('Captured timetable!'))
            .catch(() => handleShowSnackbar('Unable to capture timetable :(', false))
        })
      }
    )
  }

  return (
    <Stack sx={{ px: 2, py: 5 }}>
      <Stack spacing={3}>
        <Autocomplete
          multiple
          options={availableCourseNames}
          value={enteredCoureNames}
          renderInput={(params) => (
            <TextField {...params} label="Select courses" placeholder="Enter course name" />
          )}
          onChange={handleEnteredCourseNames}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <FormControl fullWidth>
            <InputLabel id="university-selection-label" size="small">
              University
            </InputLabel>

            <Select
              name="university"
              labelId="university-selection-label"
              size="small"
              value={courseBatchFilter.university}
              label="University"
              onChange={handleCourseBatchFilter}
            >
              {universities.map((university) => (
                <MenuItem key={university} value={university}>
                  {university}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="faculty-selection-label" size="small">
              Faculty
            </InputLabel>

            <Select
              name="faculty"
              labelId="faculty-selection-label"
              size="small"
              value={courseBatchFilter.faculty}
              label="Faculty"
              onChange={handleCourseBatchFilter}
            >
              <MenuItem value="">All</MenuItem>

              {avaliableFaculties.map((faculty) => (
                <MenuItem key={faculty} value={faculty}>
                  {faculty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Fragment>
          <Typography variant="caption" component="div" sx={{ pl: 1 }}>
            <b>Day off</b>
          </Typography>

          <Stack
            spacing={3}
            direction={{
              xs: 'column',
              md: 'row',
            }}
          >
            <FormControl
              sx={{
                width: {
                  xs: '100%',
                  md: '15%',
                },
              }}
            >
              <TextField
                name="days"
                label="Number of days"
                type="number"
                size="small"
                value={timetableFilter.dayOff?.days}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: 6,
                  },
                }}
                onChange={handleChangeDayOffFilter}
              />
            </FormControl>

            <FormControl
              sx={{
                width: {
                  xs: '100%',
                  md: '85%',
                },
              }}
            >
              <InputLabel id="daysoff-selection-label" size="small">
                Specific days
              </InputLabel>

              <Select
                name="specificDays"
                labelId="daysoff-selection-label"
                multiple
                size="small"
                value={timetableFilter.dayOff?.specificDays}
                onChange={handleChangeDayOffFilter}
                input={<OutlinedInput label="Specific days" />}
                renderValue={(selected: DayOfWeek[]) =>
                  selected.map((val) => convertDayNumberToDayString(val)).join(', ')
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                      width: 250,
                    },
                  },
                }}
              >
                {daysOfWeek.map((day, i) => (
                  <MenuItem key={i} value={i}>
                    <Checkbox checked={timetableFilter.dayOff!.specificDays!.indexOf(i) > -1} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Fragment>

        <Fragment>
          <Typography variant="caption" component="div" sx={{ pl: 1 }}>
            <b>Lecturer</b>
          </Typography>

          <Box width="100%">
            <Grid container rowSpacing={3} columnSpacing={1}>
              {timetableFilter.lecturer &&
                Object.entries(timetableFilter.lecturer).map(([courseName], i) => (
                  <Grid key={courseName} item xs={12} md={6} lg={3}>
                    <Stack spacing={2}>
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          pl: 1,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 1,
                        }}
                      >
                        {courseName}
                      </Typography>

                      <FormControl>
                        <InputLabel id={`expected-lecturer-label-${i}`} size="small">
                          Expect
                        </InputLabel>
                        <Select
                          name="expectations"
                          multiple
                          labelId={`expected-lecturer-label-${i}`}
                          size="small"
                          value={timetableFilter.lecturer![courseName]?.expectations}
                          onChange={handleChangeLecturerFilter(courseName)}
                          input={<OutlinedInput label="Expect" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  deleteIcon={
                                    <Cancel onMouseDown={(event) => event.stopPropagation()} />
                                  }
                                  onDelete={(e) => {
                                    setTimetableFilter((state) => {
                                      const newState = { ...state }
                                      const deletedIndex =
                                        newState.lecturer![courseName]!.expectations?.indexOf('')
                                      newState.lecturer![courseName]!.expectations?.splice(
                                        deletedIndex || 0,
                                        1
                                      )

                                      return newState
                                    })
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 224,
                                width: 250,
                              },
                            },
                          }}
                          sx={{ width: '100%' }}
                        >
                          {!Array.isArray(
                            lecturersOfCourses[courseBatchFilter.university]?.[courseName]
                          ) ? (
                            <MenuItem disabled>Nothing here</MenuItem>
                          ) : (
                            lecturersOfCourses[courseBatchFilter.university]?.[courseName].map(
                              (lecturer, i) => (
                                <MenuItem key={i} value={lecturer}>
                                  {lecturer}
                                </MenuItem>
                              )
                            )
                          )}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <InputLabel id={`unexpected-lecturer-label-${i}`} size="small">
                          Unexpect
                        </InputLabel>
                        <Select
                          name="unexpectations"
                          multiple
                          label={`unexpected-lecturer-label-${i}`}
                          size="small"
                          value={timetableFilter.lecturer![courseName]?.unexpectations}
                          onChange={handleChangeLecturerFilter(courseName)}
                          input={<OutlinedInput label="Unexpect" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  deleteIcon={
                                    <Cancel onMouseDown={(event) => event.stopPropagation()} />
                                  }
                                  onDelete={(e) => {
                                    setTimetableFilter((state) => {
                                      const newState = { ...state }
                                      const deletedIndex =
                                        newState.lecturer![courseName]!.unexpectations?.indexOf('')
                                      newState.lecturer![courseName]!.unexpectations?.splice(
                                        deletedIndex || 0,
                                        1
                                      )

                                      return newState
                                    })
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 224,
                                width: 250,
                              },
                            },
                          }}
                          sx={{ width: '100%' }}
                        >
                          {!Array.isArray(
                            lecturersOfCourses[courseBatchFilter.university]?.[courseName]
                          ) ? (
                            <MenuItem disabled>Nothing here</MenuItem>
                          ) : (
                            lecturersOfCourses[courseBatchFilter.university]?.[courseName].map(
                              (lecturer, i) => (
                                <MenuItem key={i} value={lecturer}>
                                  {lecturer}
                                </MenuItem>
                              )
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Fragment>

        <Button variant="contained" onClick={handleGenerateTimetable}>
          Generate
        </Button>
      </Stack>

      <Box>
        <InfiniteScroll
          dataLength={timetables.hidden.length}
          next={loadMoreTimetable}
          hasMore={timetables.hidden.length > 0}
          loader={
            <Typography
              variant="body2"
              component="div"
              sx={{
                textAlign: 'center',
                fontWeight: 500,
                mt: 2,
              }}
            >
              Scroll to see more...
            </Typography>
          }
          endMessage={
            <Typography
              variant="body2"
              component="div"
              sx={{
                textAlign: 'center',
                fontWeight: 500,
                mt: 2,
              }}
            >
              Yay! You have seen it all
            </Typography>
          }
        >
          {timetables.displayed.map((timetable, i) => (
            <Box key={i} sx={{ py: 2 }}>
              <Toolbar>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  data-timetable-id={`timetable-${i}`}
                  sx={{ mr: 2 }}
                  onClick={captureTimetable}
                >
                  <CenterFocusStrong />
                </IconButton>
              </Toolbar>

              <TableContainer id={`timetable-${i}`} component={Paper}>
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
                          if (!isValidCell(timetable, i, row + 1)) {
                            return null
                          }

                          const cls = getClass(timetable, i, row + 1)

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
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'block', fontWeight: 'bold' }}
                                >
                                  {cls?.room}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'block', fontWeight: 'bold' }}
                                >
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
          ))}
        </InfiniteScroll>
      </Box>

      <Snackbar open={snackbarState.isOpen} autoHideDuration={1000} onClose={handleCloseSnackbar}>
        <Alert
          variant="filled"
          severity={snackbarState.status}
          sx={{ width: '100%' }}
          onClose={handleCloseSnackbar}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

Generation.Layout = MainLayout

export default Generation
