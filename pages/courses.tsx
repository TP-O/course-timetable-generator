import { MainLayout } from '@/layouts'
import {
  Course,
  CourseTableColumn,
  CourseTableColumnId,
  NextPageWithLayout,
  Sorting,
} from '@/types'
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
import { ChangeEvent, useState } from 'react'

const Courses: NextPageWithLayout = () => {
  const columns: readonly CourseTableColumn[] = [
    createColumn('id'),
    createColumn('name'),
    createColumn('credit'),
    createColumn('classId'),
    createColumn('capacity'),
    // createColumn('day'),
    // createColumn('beginPeriod'),
    // createColumn('periods'),
    // createColumn('room'),
    // createColumn('lecturers'),
  ]

  function createColumn(id: CourseTableColumnId): CourseTableColumn {
    const label = id[0].toUpperCase() + id.slice(1)

    return { id, label }
  }

  const courses: Course[] = [
    {
      id: 'IT120IU',
      name: 'AEntrepreneurship',
      credit: 3,
      classId: 'ITIT19CS2',
      capacity: 90,
      classes: [
        {
          day: 3,
          beginPeriod: 7,
          periods: 3,
          room: 'A2.401',
          lecturers: [],
        },
      ],
    },
    {
      id: 'PH014IU',
      name: 'BPhysics 2',
      credit: 2,
      classId: 'IELS22IU41',
      capacity: 120,
      classes: [
        {
          day: 1,
          beginPeriod: 7,
          periods: 3,
          room: 'A2.205',
          lecturers: ['P.B.Ngoc'],
        },
      ],
    },
    {
      id: 'IT120IU',
      name: 'CObject-Oriented Programming',
      credit: 4,
      classId: 'ITIT20CS02',
      capacity: 60,
      classes: [
        {
          day: 3,
          beginPeriod: 1,
          periods: 4,
          room: 'LA1.301',
          lecturers: ['T.T.Tung'],
        },
        {
          day: 4,
          beginPeriod: 7,
          periods: 3,
          room: 'A2.401',
          lecturers: ['T.T.Tung'],
        },
      ],
    },
  ]

  // Sorting
  const [sorting, setSorting] = useState<Sorting<CourseTableColumnId>>({
    by: 'name',
    direction: 'asc',
  })
  const sortableColumnIds: CourseTableColumnId[] = ['id', 'name', 'capacity', 'classId', 'credit']

  function isSortableColumn(id: any) {
    return sortableColumnIds.includes(id)
  }

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
    console.log(event.target.value)

    setKeyword(event.target.value)
  }

  function searchCourses(courses: Course[], keyword: string) {
    if (keyword === '' || keyword === undefined) {
      return courses
    }

    courses.filter(
      (course) => course.name.toLocaleLowerCase().search(keyword.toLocaleLowerCase()) >= 0
    )
  }

  // Course data
  const displayedCourses = searchCourses(sortCourses(courses), keyword)

  return (
    <Box sx={{ maxWidth: '100vw', px: 2, py: 5 }}>
      <TextField label="Course name" size="small" variant="outlined" onChange={handleSearching} />

      <TableContainer component={Paper} elevation={4} sx={{ height: 448 }}>
        <Table stickyHeader sx={{ minWidth: 650, mx: 'auto' }}>
          <TableHead
            sx={{
              backgroundColor: 'table.headerBackground',
            }}
          >
            <TableRow>
              {columns.map((column, i) => (
                <TableCell
                  align="center"
                  key={i}
                  sortDirection={sorting.by === column.id ? sorting.direction : false}
                  sx={{
                    color: 'table.headerText',
                  }}
                >
                  {isSortableColumn(column.id) ? (
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
            {displayedCourses?.map((courses, i) => (
              <TableRow key={i}>
                <TableCell component="th" scope="row">
                  {courses.id}
                </TableCell>
                <TableCell align="right">{courses.name}</TableCell>
                <TableCell align="right">{courses.credit}</TableCell>
                <TableCell align="right">{courses.classId}</TableCell>
                <TableCell align="right">{courses.capacity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

Courses.Layout = MainLayout

export default Courses
