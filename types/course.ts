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

export type CourseSearching = {
  keyword: string
  university: Univerisity
  faculty?: string
}
