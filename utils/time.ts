export function convertToDayOfWeek(index: number) {
  switch (index) {
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
