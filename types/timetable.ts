import { Course, Lesson } from './course'

export type TimetableType = TimetableDay[]

export type TimetableDay = (Omit<Course, 'lesson'> &
  Lesson & {
    color: string
  })[]
