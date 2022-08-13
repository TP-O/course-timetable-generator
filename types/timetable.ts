import { DayOfWeek } from '@/enums'
import { RequireAtLeastOne } from './common'
import { Course, Lesson } from './course'

export type Timetable = TimetableDay[]

export type TimetableDay = (Omit<Course, 'lesson'> & Lesson)[]

export type TimetableFilter = {
  dayOff?: RequireAtLeastOne<{
    days: number
    specificDays: DayOfWeek[]
  }>
  lecturer?: RequireAtLeastOne<{
    expectation: Record<string, string[]>
    unexpectation: Record<string, string[]>
  }>
}
