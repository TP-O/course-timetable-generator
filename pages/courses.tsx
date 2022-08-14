import { Time, Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import {
  getFaculties,
  getUniversities,
  getUniversityUpdatedTime,
  searchCoursesByName,
} from '@/services'
import {
  Course,
  CourseSearching,
  CourseTableColumn,
  CourseTableColumnId,
  NextPageWithLayout,
  AlertState,
  ScrollData,
  Sorting,
  Timestamp,
} from '@/types'
import { convertDayNumberToDayString } from '@/utils'
import { ContentCopy } from '@mui/icons-material'
import {
  Alert,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
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
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material'
import { ChangeEvent, Fragment, useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { debounceTime, distinctUntilChanged, fromEvent } from 'rxjs'
import date from 'date-and-time'

const universities = getUniversities()
const sortableColumnIds: CourseTableColumnId[] = ['name', 'capacity', 'credits']

function createColumn(id: CourseTableColumnId): CourseTableColumn {
  const label = id[0].toUpperCase() + id.slice(1)
  const isSortable = sortableColumnIds.includes(id)

  return { id, label, isSortable }
}

const columns: readonly CourseTableColumn[] = [
  createColumn('id'),
  createColumn('name'),
  createColumn('credits'),
  createColumn('classId'),
  createColumn('capacity'),
  createColumn('day'),
  createColumn('begin'),
  createColumn('periods'),
  createColumn('room'),
  createColumn('lecturers'),
]

const Courses: NextPageWithLayout = () => {
  // Perpare data
  const [updatedAt, setUpdatedAt] = useState<Timestamp | undefined>(undefined)
  const [faculties, setFaculties] = useState<string[]>([])

  function isOutdatedData() {
    return date.subtract(new Date(), new Date(updatedAt?.second || 0)).toDays() >= 90
  }

  // Sorting
  const [sorting, setSorting] = useState<Sorting<CourseTableColumnId>>({
    by: 'name',
    direction: 'asc',
  })

  function handleSorting(id: CourseTableColumnId) {
    const isAsc = id === sorting.by && sorting.direction === 'asc'

    setSorting({ by: id, direction: isAsc ? 'desc' : 'asc' })
  }

  function sortCourses(courses: Course[], sorting: Sorting<CourseTableColumnId>) {
    return courses.sort((pCourse: any, cCourse: any) => {
      const asc = pCourse[sorting.by] < cCourse[sorting.by] ? -1 : 1

      return sorting.direction === 'asc' ? asc : -asc
    })
  }

  // Searching
  const keyword = useRef<HTMLInputElement>(null)
  const [searching, setSearching] = useState<CourseSearching>({
    university: Univerisity.HCMIU,
    faculty: '',
    keyword: '',
  })
  const [matchedCourses, setMatchedCourses] = useState<ScrollData<Course>>({
    hidden: [],
    displayed: [],
  })
  const hasCourseCode = matchedCourses.displayed[0]?.code !== undefined

  function handleSearching(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) {
    // Reset keyword if other options changed
    if (event.target.name !== 'keyword') {
      searching.keyword = ''
    }

    if (event.target.name === 'university') {
      searching.faculty = ''
    }

    setSearching((searching) => ({ ...searching, [event.target.name]: event.target.value }))
  }

  function loadMoreCourses() {
    setMatchedCourses((state) => {
      const displayed = [...state.displayed, ...state.hidden.splice(0, 5)]

      return { ...state, displayed }
    })
  }

  const loadCourses = useCallback(
    async (keyword = '') => {
      let courses = await searchCoursesByName({
        keyword,
        faculty: searching.faculty,
        university: searching.university,
      })

      setMatchedCourses(() => {
        courses = sortCourses(courses, sorting)

        return {
          hidden: courses,
          displayed: courses.splice(0, 10),
        }
      })
    },
    [searching.faculty, searching.university, sorting]
  )

  useEffect(() => {
    getUniversityUpdatedTime(searching.university).then((updatedAt) => setUpdatedAt(updatedAt))
    getFaculties(searching.university).then((faculties) => setFaculties(faculties))
  }, [searching.university])

  useEffect(() => {
    loadCourses()

    const sub = fromEvent<ChangeEvent<HTMLInputElement>>(keyword.current!, 'keyup')
      .pipe(debounceTime(200 * Time.Millisecond), distinctUntilChanged())
      .subscribe((event) => loadCourses(event.target.value))

    return () => sub.unsubscribe()
  }, [loadCourses])

  // Copy course code
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

  async function writeCodeToClipboard(code: string) {
    try {
      await navigator.clipboard.writeText(code)

      handleShowSnackbar('Copied!')
    } catch {
      handleShowSnackbar('Unable to copy :(', false)
    }
  }

  return (
    <Stack spacing={3} sx={{ px: 2, py: 5 }}>
      {/* Searching */}
      <Stack spacing={4}>
        <TextField
          name="keyword"
          label="Search"
          size="small"
          variant="outlined"
          value={searching.keyword}
          inputRef={keyword}
          onChange={handleSearching}
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
              value={searching.university}
              label="University"
              onChange={handleSearching}
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
              value={searching.faculty}
              label="Faculty"
              onChange={handleSearching}
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
      </Stack>

      {/* Display updated time */}
      {updatedAt !== undefined && (
        <Typography
          variant="caption"
          component="div"
          sx={{
            color: isOutdatedData() ? 'red' : 'green',
            textAlign: 'right',
          }}
        >
          Updated at: {updatedAt.text}
        </Typography>
      )}

      {/* Display data */}
      <InfiniteScroll
        dataLength={matchedCourses.hidden.length}
        next={loadMoreCourses}
        hasMore={matchedCourses.hidden.length > 0}
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
            {matchedCourses.displayed.length !== 0
              ? 'Yay! You have seen it all'
              : faculties.length === 1
              ? `${searching.university} is unvaialable now :(`
              : 'Oops! Nothing matched'}
          </Typography>
        }
        scrollableTarget="course-table"
      >
        <TableContainer
          id="course-table"
          component={Paper}
          elevation={4}
          sx={{ maxHeight: 450, maxWidth: '100vw' }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              mx: 'auto',
              'th,td': {
                textAlign: 'center',
                borderLeft: '1px solid rgba(224, 224, 224, 1)',
              },
            }}
          >
            <TableHead>
              <TableRow>
                {hasCourseCode && (
                  <TableCell
                    sx={{
                      color: 'table.headerText',
                      backgroundColor: 'table.headerBackground',
                    }}
                  >
                    Code
                  </TableCell>
                )}
                {columns.map((column, i) => (
                  <TableCell
                    key={i}
                    sortDirection={sorting.by === column.id ? sorting.direction : false}
                    sx={{
                      color: 'table.headerText',
                      backgroundColor: 'table.headerBackground',
                    }}
                  >
                    {column.isSortable ? (
                      <TableSortLabel
                        active={column.id === sorting.by}
                        direction={sorting.by === column.id ? sorting.direction : 'asc'}
                        onClick={() => handleSorting(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {matchedCourses.displayed.map((course) => (
                <Fragment key={String(course.code)}>
                  <TableRow>
                    {hasCourseCode && (
                      <TableCell rowSpan={course.lessons.length + 1}>
                        <IconButton onClick={() => writeCodeToClipboard(course.code || '')}>
                          <ContentCopy />
                        </IconButton>
                      </TableCell>
                    )}
                    <TableCell component="th" scope="row" rowSpan={course.lessons.length + 1}>
                      {course.id}
                    </TableCell>
                    <TableCell
                      rowSpan={course.lessons.length + 1}
                      sx={{ textAlign: 'left !important' }}
                    >
                      {course.name}
                    </TableCell>
                    <TableCell rowSpan={course.lessons.length + 1}>{course.credits}</TableCell>
                    <TableCell rowSpan={course.lessons.length + 1}>{course.classId}</TableCell>
                    <TableCell rowSpan={course.lessons.length + 1}>{course.capacity}</TableCell>
                  </TableRow>

                  {course.lessons.map((lesson, i) => (
                    <TableRow key={String(course.code) + i}>
                      <TableCell>{convertDayNumberToDayString(lesson.day)}</TableCell>
                      <TableCell>{lesson.begin}</TableCell>
                      <TableCell>{lesson.periods}</TableCell>
                      <TableCell>{lesson.room}</TableCell>
                      <TableCell>{lesson.lecturers.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </InfiniteScroll>

      {/* Snackbar */}
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

Courses.Layout = MainLayout

export default Courses
