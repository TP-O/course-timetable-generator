import { Course, Lesson } from '../course'

export type CourseTableColumnId = keyof Omit<Course, 'classes'> | keyof Lesson

export type CourseTableColumn = {
  id: CourseTableColumnId
  label: string
  isSortable: boolean
}
