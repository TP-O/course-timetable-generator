import { DayOfWeek } from '@/enums'
import { RequireAtLeastOne } from './common'
import { Course, Lesson } from './course'

export type Timetable = TimetableDay[]

export type TimetableDay = (Omit<Course, 'lesson'> &
  Lesson & {
    color: string
  })[]

export type TimetableFilter = {
  dayOff: {
    days: number
    specificDays: DayOfWeek[]
  }
  lecturer: Record<
    string,
    RequireAtLeastOne<{
      expectations: string[]
      unexpectations: string[]
    }>
  >
}
