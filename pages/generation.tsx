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
  Typography,
} from '@mui/material'
import { ChangeEvent, Fragment, MouseEvent, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import html2canvas from 'html2canvas'
import { CenterFocusStrong } from '@mui/icons-material'

const universities = getUniversities()
const daysOfWeek = Object.keys(DayOfWeek).filter((value) => isNaN(Number(value)))

const Generation: NextPageWithLayout = () => {
  // Course searching
  const [courseNames, setCourseNames] = useState<String[]>([])
  const [selectedCoureNames, setSelectedCourseNames] = useState<String[]>([])
  const [faculties, setFaculties] = useState<string[]>([])
  const [courseSearching, setCourseSearching] = useState({
    university: Univerisity.HCMIU,
    faculty: '',
  })

  function handleSelectedCourseNames(_: any, value: String[]) {
    setSelectedCourseNames(value)
  }

  function handleCourseSearching(event: SelectChangeEvent) {
    setCourseSearching((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }))
  }

  useEffect(() => {
    getFaculties(courseSearching.university).then((faculties) => setFaculties(faculties))
  }, [courseSearching.university])

  useEffect(() => {
    getCourseNames(courseSearching.university, courseSearching.faculty).then((courseNames) =>
      setCourseNames(courseNames)
    )
  }, [courseSearching])

  // Timetable filter
  const [filter, setFilter] = useState<TimetableFilter>({
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
    setFilter((state) => {
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
      setFilter((state) => {
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
    setFilter((state) => {
      const newState = { ...state }
      const outdatedCourseNames = Object.keys(newState.lecturer!)

      // Add new courses
      selectedCoureNames.forEach((name) => {
        if (!outdatedCourseNames.includes(String(name))) {
          newState.lecturer![String(name)] = {
            expectations: [],
            unexpectations: [],
          }

          // Get lecturers for new course
          getLecturersOfCourse(courseSearching.university, String(name)).then((lecturers) =>
            setLecturersOfCourses((state) => {
              const newState = { ...state }

              newState[courseSearching.university] =
                newState[courseSearching.university] === undefined
                  ? {}
                  : state[courseSearching.university]

              newState[courseSearching.university][String(name)] =
                newState[courseSearching.university][String(name)] === undefined
                  ? lecturers
                  : newState[courseSearching.university][String(name)]

              return newState
            })
          )
        }
      })

      // Remove courses
      outdatedCourseNames.forEach((name) => {
        if (!selectedCoureNames.includes(name)) {
          delete newState.lecturer![name]
        }
      })

      return newState
    })
  }, [courseSearching.university, selectedCoureNames])

  // Generate timetables
  const [timetables, setTimetables] = useState<ScrollData<Timetable>>({
    hidden: [],
    displayed: [],
  })

  async function handleGenerateTimetable() {
    const courseGroups = await getCourseGroups(
      courseSearching.university,
      selectedCoureNames as string[]
    )
    const timetables = generateTimetables(courseGroups, filter)

    setTimetables({
      hidden: timetables,
      displayed: timetables.splice(0, 10),
    })
  }

  function loadMoreTimetable() {
    setTimetables((state) => {
      const displayed = [...state.displayed, ...state.hidden.splice(0, 5)]

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
          options={courseNames}
          value={selectedCoureNames}
          renderInput={(params) => (
            <TextField {...params} label="Select courses" placeholder="Enter course name" />
          )}
          onChange={handleSelectedCourseNames}
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
              value={courseSearching.university}
              label="University"
              onChange={handleCourseSearching}
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
              value={courseSearching.faculty}
              label="Faculty"
              onChange={handleCourseSearching}
            >
              <MenuItem value="">All</MenuItem>

              {faculties.map((faculty) => (
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
                value={filter.dayOff?.days}
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
                value={filter.dayOff?.specificDays}
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
                    <Checkbox checked={filter.dayOff!.specificDays!.indexOf(i) > -1} />
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
              {filter.lecturer &&
                Object.entries(filter.lecturer).map(([courseName], i) => (
                  <Grid key={courseName} item xs={12} md={6} lg={3}>
                    <Stack spacing={2}>
                      <Typography variant="caption" component="div" sx={{ pl: 1 }}>
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
                          value={filter.lecturer![courseName]?.expectations}
                          onChange={handleChangeLecturerFilter(courseName)}
                          input={<OutlinedInput label="Expect" />}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 224,
                                width: 250,
                              },
                            },
                          }}
                          sx={{ width: '100%' }}
                          renderValue={(selected: string[]) => selected.join(', ')}
                        >
                          {!Array.isArray(
                            lecturersOfCourses[courseSearching.university]?.[courseName]
                          ) ? (
                            <MenuItem disabled>Nothing here</MenuItem>
                          ) : (
                            lecturersOfCourses[courseSearching.university]?.[courseName].map(
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
                          value={filter.lecturer![courseName]?.unexpectations}
                          onChange={handleChangeLecturerFilter(courseName)}
                          input={<OutlinedInput label="Unexpect" />}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 224,
                                width: 250,
                              },
                            },
                          }}
                          sx={{ width: '100%' }}
                          renderValue={(selected: string[]) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <span key={value}>{value}&#44;</span>
                              ))}
                            </Box>
                          )}
                        >
                          {!Array.isArray(
                            lecturersOfCourses[courseSearching.university]?.[courseName]
                          ) ? (
                            <MenuItem disabled>Nothing here</MenuItem>
                          ) : (
                            lecturersOfCourses[courseSearching.university]?.[courseName].map(
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
                        {daysOfWeek.map((day, i) =>
                          isValidCell(timetable, i, row + 1) ? (
                            <TableCell
                              key={day}
                              rowSpan={getClass(timetable, i, row + 1)?.periods || 1}
                              sx={{ minHeight: 100 }}
                            >
                              {getClass(timetable, i, row + 1)?.name || 'day'}
                            </TableCell>
                          ) : null
                        )}
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
