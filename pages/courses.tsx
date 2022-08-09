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
import { Delete, FilterList } from '@mui/icons-material'
import {
  Box,
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
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { ChangeEvent, Fragment, useState } from 'react'

const Courses: NextPageWithLayout = () => {
  // Perpare data
  const sortableColumnIds: CourseTableColumnId[] = ['name', 'capacity', 'credit']
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
    <Stack sx={{ px: 2, py: 5 }}>
      <>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(0 > 0 && {
              bgcolor: 'red',
            }),
          }}
        >
          {0 > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {0} selected
            </Typography>
          ) : (
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
              Nutrition
            </Typography>
          )}
          {0 > 0 ? (
            <Tooltip title="Delete">
              <IconButton>
                <Delete />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Filter list">
              <IconButton>
                <FilterList />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
        <TextField label="Course name" size="small" variant="outlined" onChange={handleSearching} />
      </>

      <TableContainer component={Paper} elevation={4}>
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
    </Stack>
  )
}

Courses.Layout = MainLayout

export default Courses
