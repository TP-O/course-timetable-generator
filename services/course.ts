import { Course, CourseFilter, UniversityStorage } from '@/types'
import { matchSorter } from 'match-sorter'
import { Univerisity } from '@/enums'

const storage: UniversityStorage = {
  'HCMIU - International Univerisity': null,
  'UEH - University of Economics HCMC': null,
}

export async function loadUniversity(university: Univerisity) {
  if (storage[university] === null) {
    storage[university] = await import(`@/data/${university}.json`)
  }
}

export function getUniversities() {
  return Object.values(Univerisity)
}

export async function getFaculties(university: Univerisity) {
  await loadUniversity(university)

  return ['', ...Object.keys(storage[university]?.faculties || {})]
}

export async function searchCoursesByName(filter: CourseFilter) {
  await loadUniversity(filter.university)

  const courseNames =
    filter.faculty === undefined || filter.faculty === ''
      ? Object.keys(storage[filter.university]?.courses || {})
      : Object.keys(storage[filter.university]?.faculties[filter.faculty].courses || {})

  const filteredCourseNames =
    filter.keyword === '' ? courseNames : matchSorter(courseNames, filter.keyword)
  const filteredCourses: Course[] = []

  for (const courseName of filteredCourseNames) {
    filteredCourses.push(...(storage[filter.university]?.courses[courseName] || []))
  }

  return filteredCourses
}
