import { DayOfWeek } from '@/enums'

export function convertDayStringToDayNumber(day: string) {
  switch (day) {
    case 'Hai':
    case 'Mon':
      return DayOfWeek.Mon
    case 'Ba':
    case 'Tue':
      return DayOfWeek.Tue
    case 'Tư':
    case 'Wed':
      return DayOfWeek.Wed
    case 'Năm':
    case 'Thu':
      return DayOfWeek.Thu
    case 'Sáu':
    case 'Fri':
      return DayOfWeek.Fri
    case 'Bảy':
    case 'Sat':
      return DayOfWeek.Sat
    default:
      return DayOfWeek.Sun
  }
}

export function convertDayNumberToDayString(day: number) {
  switch (day) {
    case 0:
      return 'Mon'
    case 1:
      return 'Tue'

    case 2:
      return 'Wed'

    case 3:
      return 'Thu'

    case 4:
      return 'Fri'

    case 5:
      return 'Sat'

    default:
      return 'Sun'
  }
}
