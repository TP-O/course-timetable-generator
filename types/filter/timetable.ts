import { DayOfWeek } from '@/enums'

export type LecturerFilterType = Record<
  string,
  {
    expectations: string[]
    unexpectations: string[]
  }
>

export type WeekFilterType = {
  days: number
  specificDays: DayOfWeek[]
}

export type TimetableFilter = {
  week: WeekFilterType
  lecturers: LecturerFilterType
}
