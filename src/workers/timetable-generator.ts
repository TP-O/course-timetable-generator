import sortBy from 'lodash/sortBy'
import courseDetailData from '~/data/details.json'
import type { PartialCourse, TimetableGenerationResult } from '~/types'

let result: TimetableGenerationResult = {
  totalCases: 0,
  validCases: 0,
  expectedCases: 0,
  timetables: [],
}

function queryCourses(courses: string[]) {
  const potentialCourses: PartialCourse[][][] = []

  courses.forEach((course) => {
    if (Object.keys(courseDetailData).includes(course)) {
      potentialCourses.push(
        courseDetailData[(course as keyof typeof courseDetailData)] as PartialCourse[][])
    }
  })

  return potentialCourses
}

function resetResult() {
  result = {
    totalCases: 0,
    validCases: 0,
    expectedCases: 0,
    timetables: [],
  }
}

function isOverlapped(course1: PartialCourse, course2: PartialCourse) {
  if (course1.dayOfWeek !== course2.dayOfWeek)
    return false

  if ((course1.start >= course2.start && course1.start <= course2.start + course2.period - 1)
    || (course2.start >= course1.start && course2.start <= course1.start + course1.period - 1))
    return true

  return false
}

function generateTimetable(partialsCoursesList: PartialCourse[][]) {
  const timetable: PartialCourse[][] = [[], [], [], [], [], [], []]

  for (const partialsCourses of partialsCoursesList) {
    // pclass means potential class
    for (const pclass of partialsCourses) {
      for (const day of timetable) {
        // vclass means valid class
        for (const vclass of day) {
          if (isOverlapped(vclass, pclass))
            return null
        }
      }

      timetable[pclass.dayOfWeek].push(pclass)

      // Sort by start property
      timetable[pclass.dayOfWeek] = sortBy(timetable[pclass.dayOfWeek], [o => o.start])
    }
  }

  result.validCases++

  return timetable
}

function generateTimetables(potentialCourses: PartialCourse[][][]) {
  const numberOfCourses = potentialCourses.length
  const currentIndexes = new Array(numberOfCourses).fill(0)
  const numberOfCourseInstances = potentialCourses.map(course => course.length)
  result.totalCases = numberOfCourseInstances.reduce((pre, number) => pre * number, 1)

  for (let i = 0; i < result.totalCases; i++) {
    const selectedCourses: PartialCourse[][] = []

    for (let j = 0; j < numberOfCourses; j++)
      selectedCourses.push(potentialCourses[j][currentIndexes[j]])

    const timetable = generateTimetable(selectedCourses)

    if (timetable)
      result.timetables.push(timetable)

    // Increse index of courses
    for (let j = currentIndexes.length - 1; j >= 0; j--) {
      if (currentIndexes[j + 1] === undefined) {
        currentIndexes[j] = (currentIndexes[j] + 1) % numberOfCourseInstances[j]
      }
      else {
        let increase = true

        for (let k = j + 1; k < currentIndexes.length; k++) {
          if (currentIndexes[k] !== 0) {
            increase = false

            break
          }
        }

        if (increase)
          currentIndexes[j] = (currentIndexes[j] + 1) % numberOfCourseInstances[j]
      }
    }
  }
}

export function gogogogogo(courses: string[]) {
  resetResult()
  generateTimetables(queryCourses(courses))

  return result
}

onmessage = function(e) {
  resetResult()

  const courseNames = JSON.parse(e.data[0]) as string[]
  const potentialCourses = queryCourses(courseNames)

  // Generate timetables if and only if number of potential courses and course names are the same
  if (potentialCourses.length === courseNames.length) {
    generateTimetables(potentialCourses)

    this.postMessage([JSON.stringify(result)])
  }
  else {
    this.postMessage([JSON.stringify({
      totalCases: 0,
      validCases: 0,
      expectedCases: 0,
      timetables: [],
    })])
  }
}
