import { MainLayout } from '@/layouts'
import { searchCoursesByName } from '@/services'
import {
  Course,
  CourseTableColumn,
  CourseTableColumnId,
  NextPageWithLayout,
  Sorting,
} from '@/types'
import { convertToDayOfWeek } from '@/utils'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from '@mui/material'
import { ChangeEvent, Fragment, useState } from 'react'

const Courses: NextPageWithLayout = () => {
  // Perpare data
  const sortableColumnIds: CourseTableColumnId[] = ['id', 'name', 'capacity', 'classId', 'credit']
  const columns: readonly CourseTableColumn[] = [
    createColumn('id'),
    createColumn('name'),
    createColumn('credit'),
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
  const [keyword, setKeyword] = useState('')

  function handleSearching(event: ChangeEvent<HTMLInputElement>) {
    setKeyword(event.target.value)
  }

  // Displayment
  const displayedCourses = sortCourses(searchCoursesByName(keyword))

  return (
    <Box sx={{ maxWidth: '100vw', px: 2, py: 5 }}>
      <TextField label="Course name" size="small" variant="outlined" onChange={handleSearching} />

      <TableContainer component={Paper} elevation={4} sx={{ height: 448 }}>
        <Table
          stickyHeader
          sx={{
            minWidth: 650,
            mx: 'auto',
            'th,td': {
              textAlign: 'center',
            },
          }}
        >
          <TableHead
            sx={{
              backgroundColor: 'table.headerBackground',
            }}
          >
            <TableRow>
              {columns.map((column, i) => (
                <TableCell
                  key={i}
                  sortDirection={sorting.by === column.id ? sorting.direction : false}
                  sx={{
                    color: 'table.headerText',
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
              <Fragment key={course.id + course.classId}>
                <TableRow>
                  <TableCell component="th" scope="row" rowSpan={course.classes.length + 1}>
                    {course.id}
                  </TableCell>
                  <TableCell
                    rowSpan={course.classes.length + 1}
                    sx={{ textAlign: 'left !important' }}
                  >
                    {course.name}
                  </TableCell>
                  <TableCell rowSpan={course.classes.length + 1}>{course.credit}</TableCell>
                  <TableCell rowSpan={course.classes.length + 1}>{course.classId}</TableCell>
                  <TableCell rowSpan={course.classes.length + 1}>{course.capacity}</TableCell>
                </TableRow>

                {course.classes.map((classs, i) => (
                  <TableRow key={course.id + course.classId + i}>
                    <TableCell>{convertToDayOfWeek(classs.day)}</TableCell>
                    <TableCell>{classs.begin}</TableCell>
                    <TableCell>{classs.periods}</TableCell>
                    <TableCell>{classs.room}</TableCell>
                    <TableCell>{classs.lecturers.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

Courses.Layout = MainLayout

export default Courses
