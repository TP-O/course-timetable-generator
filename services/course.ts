import { Course } from '@/types'
import { matchSorter } from 'match-sorter'
import { Univerisity } from '@/enums'
import { UniversityStorage } from '@/types/storage'
import { CourseFilterType } from '@/types/filter'

const storage: UniversityStorage = {
  'HCMIU - International Univerisity': undefined,
  'UEH - University of Economics HCMC': undefined,
}

export async function loadUniversity(university: Univerisity) {
  if (!storage[university]) {
    try {
      storage[university] = await import(`@/data/${university}.json`)
    } catch {
      storage[university] = {
        faculties: {},
        courses: {},
        updatedAt: {
          seconds: 0,
          text: 'Unknown',
        },
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
      seconds: 0,
      text: 'Unknown',
    }
  )
}

export async function getFaculties(university: Univerisity) {
  await loadUniversity(university)

  return Object.keys(storage[university]?.faculties || {})
}

export async function getCourseLecturers(university: Univerisity, courseName: string) {
  await loadUniversity(university)

  return storage[university]?.courses[courseName].lecturers || []
}

export async function getCourseNames(university: Univerisity, faculty = '') {
  await loadUniversity(university)

  return faculty === ''
    ? Object.keys(storage[university]?.courses || {})
    : Object.keys(storage[university]?.faculties[faculty]?.courseLecturers || {})
}

export async function getCourseGroups(university: Univerisity, courseNames: string[]) {
  await loadUniversity(university)

  return courseNames.map((name) => Object.values(storage[university]?.courses[name]?.items || []))
}

export async function searchCourses(keyword: string, filter: CourseFilterType) {
  await loadUniversity(filter.university)

  const courseNames =
    filter.faculty === undefined || filter.faculty === ''
      ? Object.keys(storage[filter.university]?.courses || {})
      : Object.keys(storage[filter.university]?.faculties[filter.faculty]?.courseLecturers || {})

  const filteredCourseNames = keyword === '' ? courseNames : matchSorter(courseNames, keyword)
  const filteredCourses: Course[] = []

  for (const courseName of filteredCourseNames) {
    filteredCourses.push(...(storage[filter.university]?.courses[courseName].items || []))
  }

  return filteredCourses
}
