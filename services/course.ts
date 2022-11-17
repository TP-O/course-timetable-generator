import { Course, CourseFilter, UniversityStorage } from '@/types'
import { matchSorter } from 'match-sorter'
import { Univerisity } from '@/enums'

const storage: UniversityStorage = {
  'HCMIU - International Univerisity': null,
  'UEH - University of Economics HCMC': null,
}

export async function loadUniversity(university: Univerisity) {
  if (storage[university] === null) {
    try {
      storage[university] = await import(`@/data/${university}.json`)
    } catch {
      storage[university] = {
        faculties: {},
        courses: {},
      }
    }
  }
}

export function getUniversities() {
  return Object.values(Univerisity)
}

export async function getUniversityUpdatedTime(university: Univerisity) {
  await loadUniversity(university)

  return (
    storage[university]?.updatedAt || {
      second: 0,
      text: 'Unknown',
    }
  )
}

export async function getFaculties(university: Univerisity) {
  await loadUniversity(university)

  return ['', ...Object.keys(storage[university]?.faculties || {})]
}

export async function getLecturersOfCourse(university: Univerisity, courseName: string) {
  await loadUniversity(university)

  return storage[university]?.courses[courseName].lecturers || []
}

export async function getCourseNames(university: Univerisity, faculty = '') {
  await loadUniversity(university)

  return faculty === ''
    ? Object.keys(storage[university]?.courses || {})
    : Object.keys(storage[university]?.faculties[faculty]?.courses || {})
}

export async function getCourseGroups(university: Univerisity, courseNames: string[]) {
  await loadUniversity(university)

  return courseNames.map((name) => Object.values(storage[university]?.courses[name]?.items || []))
}

export async function searchCourses(filter: CourseFilter) {
  await loadUniversity(filter.university)

  const courseNames =
    filter.faculty === undefined || filter.faculty === ''
      ? Object.keys(storage[filter.university]?.courses || {})
      : Object.keys(storage[filter.university]?.faculties[filter.faculty]?.courses || {})

  const filteredCourseNames =
    filter.keyword === '' ? courseNames : matchSorter(courseNames, filter.keyword)
  const filteredCourses: Course[] = []

  for (const courseName of filteredCourseNames) {
    filteredCourses.push(...(storage[filter.university]?.courses[courseName].items || []))
  }

  return filteredCourses
}
