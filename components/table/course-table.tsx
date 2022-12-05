import { Course } from '@/types'
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
} from '@mui/material'
import { Check, ContentCopy, CopyAll } from '@mui/icons-material'
import { ChangeEvent, Fragment, useContext, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { convertDayNumberToDayString } from '@/utils'
import { AppContext } from '@/contexts'
import { searchCourses } from '@/services'
import { CourseFilterType } from '@/types/filter'
import { CourseTableColumn, CourseTableColumnId, LazyData, Sorting } from '@/types/component'
import { NotificationType } from '@/enums'

type CourseTableProps = {
  empty?: boolean
  keyword: string
  courseFilter: CourseFilterType
}

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

export function CourseTable({ empty = false, keyword, courseFilter }: CourseTableProps) {
  // Sort course by column
  const [sorting, setSorting] = useState<Sorting<CourseTableColumnId>>({
    by: 'name',
    direction: 'asc',
  })

  function reverseSorting(id: CourseTableColumnId) {
    const isAsc = id === sorting.by && sorting.direction === 'asc'
    setSorting({ by: id, direction: isAsc ? 'desc' : 'asc' })
  }

  function sortCourses(courses: Course[], sorting: Sorting<CourseTableColumnId>) {
    return courses.sort((pCourse: any, cCourse: any) => {
      const asc = pCourse[sorting.by] < cCourse[sorting.by] ? -1 : 1

      return sorting.direction === 'asc' ? asc : -asc
    })
  }

  // Load courses
  const [courses, setCourses] = useState<LazyData<Course>>({
    show: [],
    hide: [],
  })
  const [hasCode, setHasCode] = useState(false)
  const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>([])

  function loadMoreShowCourses() {
    const size = 5

    setCourses((courses) => {
      const showCourses = [...courses.show, ...courses.hide.splice(0, size)]

      return { ...courses, show: showCourses }
    })
  }

  function selectCourseCode(code: string) {
    return (_: ChangeEvent, checked: boolean) => {
      setSelectedCourseCodes((selectedCourseCodes) => {
        const codeIndex = selectedCourseCodes.indexOf(code)

        if (checked && codeIndex === -1) {
          selectedCourseCodes.push(code)
        } else if (!checked && codeIndex !== -1) {
          selectedCourseCodes.splice(codeIndex, 1)
        }

        return [...selectedCourseCodes]
      })
    }
  }

  useEffect(() => {
    ;(async () => {
      let courses = await searchCourses(keyword, courseFilter)

      setCourses(() => {
        courses = sortCourses(courses, sorting)

        return {
          hide: courses,
          show: courses.splice(0, 10),
        }
      })

      setHasCode(courses[0]?.code !== undefined)
    })()
  }, [courseFilter, sorting, keyword])

  // Copy course code
  const { showNotification } = useContext(AppContext)

  function copyCommand() {
    navigator.clipboard
      .writeText(`-I "${selectedCourseCodes.join('" -I "')}"`)
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

  return (
    <Stack>
      {selectedCourseCodes.length > 0 && (
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="subtitle2"
            sx={{ ml: 4, fontStyle: 'italic', fontWeight: 'bold' }}
          >{`${selectedCourseCodes.length} course(s) selected...`}</Typography>

          <Toolbar>
            {hasCode && (
              <IconButton
                size="large"
                edge="start"
                color="primary"
                sx={{ mr: 2 }}
                onClick={copyCommand}
              >
                <CopyAll />
              </IconButton>
            )}
          </Toolbar>
        </Stack>
      )}

      <InfiniteScroll
        dataLength={courses.hide.length}
        next={loadMoreShowCourses}
        hasMore={courses.hide.length > 0}
        scrollableTarget="course-table"
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
            {courses.show.length !== 0
              ? 'Yay! You have seen it all'
              : empty
              ? `Data is unvaialable now :(`
              : 'Oops! Nothing matched'}
          </Typography>
        }
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
                <TableCell
                  sx={{
                    color: 'table.headerText',
                    backgroundColor: 'table.headerBackground',
                  }}
                >
                  <Check />
                </TableCell>
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
                        onClick={() => reverseSorting(column.id)}
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
              {courses.show.map((course) => (
                <Fragment key={String(course.code)}>
                  <TableRow
                    sx={{
                      background: selectedCourseCodes.includes(String(course.code))
                        ? '#CDDEEE'
                        : 'transparent',
                    }}
                  >
                    <TableCell rowSpan={course.lessons.length + 1}>
                      <Checkbox
                        checked={selectedCourseCodes.includes(String(course.code))}
                        onChange={selectCourseCode(String(course.code))}
                      />
                    </TableCell>
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
                    <TableRow
                      key={String(course.code) + i}
                      sx={{
                        background: selectedCourseCodes.includes(String(course.code))
                          ? '#CDDEEE'
                          : 'transparent',
                      }}
                    >
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
    </Stack>
  )
}
