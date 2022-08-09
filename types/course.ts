export type Course = {
  code?: string
  id: string
  name: string
  credit: number
  capacity: number
  classId: string
  classes: Class[]
}

type Class = {
  day: DayOfWeek
  room: string
  begin: number
  periods: number
  lecturers: string[]
}

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type CourseTableColumnId = keyof Omit<Course, 'classes'> | keyof Class

export type CourseTableColumn = {
  id: CourseTableColumnId
  label: string
  isSortable: boolean
}

export type CourseFilter = {
  keyword?: string
  university?: string
  faculty?: string
}
