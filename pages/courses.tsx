import { Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import { getFaculties, getUniversities, searchCoursesByName } from '@/services'
import {
  CopyStatus,
  Course,
  CourseFilter,
  CourseTableColumn,
  CourseTableColumnId,
  NextPageWithLayout,
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
} from '@mui/material'
import { ChangeEvent, Fragment, useEffect, useState } from 'react'

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

  function createColumn(id: CourseTableColumnId): CourseTableColumn {
    const label = id[0].toUpperCase() + id.slice(1)
    const isSortable = sortableColumnIds.includes(id)

    return { id, label, isSortable }
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

  function sortCourses(courses: Course[]) {
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

  function handleSearching(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) {
    setFilter((filter) => ({ ...filter, [event.target.name]: event.target.value }))
  }

  // Copy course code
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({
    message: '',
    status: 'success',
  })

  function handleCloseSnackbar() {
    setShowSnackbar(false)
  }

  function handleShowSnackbar(message: string, success = true) {
    setCopyStatus({ message, status: success ? 'success' : 'error' })
    setShowSnackbar(true)
  }

  async function writeCodeToClipboard(code: string) {
    try {
      await navigator.clipboard.writeText(code)

      handleShowSnackbar('Copied!')
    } catch {
      handleShowSnackbar('Unable to copy :(')
    }
  }

  // hello
  const university = getUniversities()
  const [faculties, setFaculties] = useState<string[]>([])
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([])
  const [hasCode, setHasCode] = useState(false)

  // Dynamic daya
  useEffect(() => {
    ;(async () => {
      setFaculties(await getFaculties(Univerisity.HCMIU))
      setDisplayedCourses(sortCourses(await searchCoursesByName(filter)).splice(2, 5))
      setHasCode(displayedCourses[0]?.code !== undefined)
    })()

    console.log('hehello')
  }, [])

  console.log('huhuhuh')

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
      <TableContainer component={Paper} elevation={4} sx={{ maxHeight: 500 }}>
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
              {hasCode && (
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
            {displayedCourses.map((course) => (
              <Fragment key={String(course.code)}>
                <TableRow>
                  {hasCode && (
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

      {/* Snackbar */}
      <Snackbar open={showSnackbar} autoHideDuration={1000} onClose={handleCloseSnackbar}>
        <Alert
          variant="filled"
          severity={copyStatus.status}
          sx={{ width: '100%' }}
          onClose={handleCloseSnackbar}
        >
          {copyStatus.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

Courses.Layout = MainLayout

export default Courses
