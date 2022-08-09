import { Course } from '@/types'
import { matchSorter } from 'match-sorter'

const courses: Course[] = [
  {
    id: 'IT120IU',
    name: 'Entrepreneurship',
    credit: 3,
    classId: 'ITIT19CS2',
    capacity: 90,
    classes: [
      {
        day: 3,
        begin: 7,
        periods: 3,
        room: 'A2.401',
        lecturers: [],
      },
    ],
  },
  {
    id: 'PH014IU',
    name: 'Physics 2',
    credit: 2,
    classId: 'IELS22IU41',
    capacity: 120,
    classes: [
      {
        day: 1,
        begin: 7,
        periods: 3,
        room: 'A2.205',
        lecturers: ['P.B.Ngoc'],
      },
    ],
  },
  {
    id: 'IT120IU',
    name: 'Object-Oriented Programming',
    credit: 4,
    classId: 'ITIT20CS02',
    capacity: 60,
    classes: [
      {
        day: 3,
        begin: 1,
        periods: 4,
        room: 'LA1.301',
        lecturers: ['T.T.Tung'],
      },
      {
        day: 4,
        begin: 7,
        periods: 3,
        room: 'A2.401',
        lecturers: ['T.T.Tung'],
      },
    ],
  },
]

export function searchCoursesByName(keyword: string) {
  return matchSorter(courses, keyword, {
    keys: ['name'],
  })
}
