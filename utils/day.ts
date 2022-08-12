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

export function convertDayNumberToDayString(day: number | DayOfWeek) {
  switch (day) {
    case DayOfWeek.Mon:
      return 'Mon'

    case DayOfWeek.Tue:
      return 'Tue'

    case DayOfWeek.Wed:
      return 'Wed'

    case DayOfWeek.Thu:
      return 'Thu'

    case DayOfWeek.Fri:
      return 'Fri'

    case DayOfWeek.Sat:
      return 'Sat'

    default:
      return 'Sun'
  }
}
