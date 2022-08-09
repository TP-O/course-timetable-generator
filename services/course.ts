import { Course, CourseFilter } from '@/types'
import { matchSorter } from 'match-sorter'

const courses: Course[] = [
  {
    code: 'cc',
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

const faculties: Record<string, string[]> = {
  IU: ['IT', 'BA', 'EE', 'CC'],
  HCMUS: ['NN', 'AA', 'EE'],
}

const universities = ['IU', 'HCMUS']

export function searchCoursesByName(filter: CourseFilter) {
  return matchSorter(courses, String(filter.keyword), {
    keys: ['name'],
  })
}

export function getFacultiesOfUniversity(university: string) {
  return faculties[university] ?? []
}

export function getUniversities() {
  return universities
}
