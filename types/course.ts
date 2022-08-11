import { DayOfWeek, Univerisity } from '@/enums'

export type Course = {
  code?: string
  id: string
  name: string
  credits: number
  capacity: number
  classId: string
  lessons: Lesson[]
}

export type Lesson = {
  day: DayOfWeek
  room: string
  begin: number
  periods: number
  lecturers: string[]
}

export type CourseTableColumnId = keyof Omit<Course, 'classes'> | keyof Lesson

export type CourseTableColumn = {
  id: CourseTableColumnId
  label: string
  isSortable: boolean
}

export type CourseFilter = {
  keyword: string
  university: Univerisity
  faculty?: string
}

export type MatchedCourses = {
  hidden: Course[]
  displayed: Course[]
}
