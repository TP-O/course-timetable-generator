import { Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import { getFaculties, getUniversities, searchCoursesByName } from '@/services'
import {
  Course,
  CourseFilter,
  CourseTableColumn,
  CourseTableColumnId,
  MatchedCourses,
  NextPageWithLayout,
  SnackbarState,
  Sorting,
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
import { display } from '@mui/system'
import { ChangeEvent, Fragment, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const Courses: NextPageWithLayout = () => {
  // Perpare data
  const sortableColumnIds: CourseTableColumnId[] = ['name', 'capacity', 'credits']
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
  const university = getUniversities()
  const [faculties, setFaculties] = useState<string[]>([])

  function createColumn(id: CourseTableColumnId): CourseTableColumn {
    const label = id[0].toUpperCase() + id.slice(1)
    const isSortable = sortableColumnIds.includes(id)

    return { id, label, isSortable }
  }

  useEffect(() => {
    getFaculties(Univerisity.HCMIU).then((faculties) => setFaculties(faculties))
  }, [])

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
  const [filter, setFilter] = useState<CourseFilter>({
    keyword: '',
    university: Univerisity.HCMIU,
    faculty: '',
  })
  const [matchedCourses, setMatchedCourses] = useState<MatchedCourses>({
    hidden: [],
    displayed: [],
  })
  const hasCourseCode = matchedCourses.displayed[0]?.code !== undefined

  function handleSearching(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) {
    setFilter((filter) => ({ ...filter, [event.target.name]: event.target.value }))
  }

  function loadMoreCourses() {
    if (matchedCourses.hidden.length === 0) {
      return
    }

    setMatchedCourses((state) => {
      const displayed = [...state.displayed, ...state.hidden.splice(0, 5)]

      return { ...state, displayed }
    })
  }

  useEffect(() => {
    searchCoursesByName(filter).then((courses) =>
      setMatchedCourses((state) => {
        courses = sortCourses(courses, sorting)

        return {
          hidden: courses,
          displayed: courses.splice(0, 10),
        }
      })
    )
  }, [filter, sorting])

  // Copy course code
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
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
          onChange={handleSearching}
        />

        <Stack direction="row" spacing={4}>
          <FormControl fullWidth>
            <InputLabel id="university" size="small">
              University
            </InputLabel>

            <Select
              name="university"
              labelId="university"
              id="demo-simple-select"
              size="small"
              value={filter.university}
              label="University"
              onChange={handleSearching}
            >
              {university.map((university) => (
                <MenuItem key={university} value={university}>
                  {university}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="faculty" size="small">
              Faculty
            </InputLabel>

            <Select
              name="faculty"
              labelId="faculty"
              id="demo-simple-select"
              size="small"
              value={filter.faculty}
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
            Yay! You have seen it all
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
