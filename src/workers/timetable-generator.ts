import sortBy from 'lodash/sortBy'
import courseDetailData from '~/data/course-details.json'
import type { Filter, PartialCourse, TimetableGenerationResult } from '~/types'

let result: TimetableGenerationResult = {
  totalCases: 0,
  validCases: 0,
  expectedCases: 0,
  timetables: [],
}

let checkState = {
  numberOfRelaxationDays: 0,
}

function resetResult() {
  result = {
    totalCases: 0,
    validCases: 0,
    expectedCases: 0,
    timetables: [],
  }
}

function resetCheckState() {
  checkState = {
    numberOfRelaxationDays: 0,
  }
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

function checkNumberOfRelaxationDays(day: number, numberOfCourse: number, min: number) {
  checkState.numberOfRelaxationDays = numberOfCourse === 0
    ? ++checkState.numberOfRelaxationDays
    : checkState.numberOfRelaxationDays

  // Return result if it is the last day of week
  if (day === 6)
    return checkState.numberOfRelaxationDays >= min

  // Return false if number of days remaining is less than relaxation days remaining
  if (6 - day < min - checkState.numberOfRelaxationDays)
    return false

  // Return true until above 2 conditions do not occur
  return true
}

function checkSpecificRelaxationDays(day: number, numberOfCourse: number, specificDays: number[]) {
  if (!specificDays.includes(day))
    return true

  // The relaxation day must have no course
  return numberOfCourse === 0
}

function checkLectuturers(courses: PartialCourse[], lecturerFilter: Pick<Filter, 'lecturer'>) {
  for (const course of courses) {
    const lecturerName = course.room.includes('LA')
      ? `${course.lecturer} (Lab)`
      : course.lecturer

    if (lecturerFilter.lecturer.expected[course.name] !== undefined
    && lecturerFilter.lecturer.expected[course.name].length !== 0
    && !lecturerFilter.lecturer.expected[course.name].includes(lecturerName))
      return false

    if (lecturerFilter.lecturer.unexpected[course.name] !== undefined
    && lecturerFilter.lecturer.unexpected[course.name].length !== 0
    && lecturerFilter.lecturer.unexpected[course.name].includes(lecturerName))
      return false
  }

  return true
}

function isExpected(timetable: PartialCourse[][], filter: Filter) {
  resetCheckState()

  for (let day = 0; day < 7; day++) {
    const numberOfCourses = timetable[day].length

    if (!checkNumberOfRelaxationDays(day, numberOfCourses, filter.day.numberOfRelaxationDays)
    || !checkSpecificRelaxationDays(day, numberOfCourses, filter.day.specificDays)
    || !checkLectuturers(timetable[day], { lecturer: filter.lecturer }))
      return false
  }

  return true
}

function isOverlapped(course1: PartialCourse, course2: PartialCourse) {
  if (course1.dayOfWeek !== course2.dayOfWeek)
    return false

  if ((course1.start >= course2.start && course1.start <= course2.start + course2.period - 1)
  || (course2.start >= course1.start && course2.start <= course1.start + course1.period - 1))
    return true

  return false
}

function generateTimetable(partialsCoursesList: PartialCourse[][], filter: Filter) {
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

  if (!isExpected(timetable, filter))
    return null

  result.expectedCases++

  return timetable
}

function generateTimetables(potentialCourses: PartialCourse[][][], filter: Filter) {
  const numberOfCourses = potentialCourses.length
  const currentIndexes = new Array(numberOfCourses).fill(0)
  const numberOfCourseInstances = potentialCourses.map(course => course.length)
  result.totalCases = numberOfCourseInstances.reduce((pre, number) => pre * number, 1)

  for (let i = 0; i < result.totalCases; i++) {
    const selectedCourses: PartialCourse[][] = []

    for (let j = 0; j < numberOfCourses; j++)
      selectedCourses.push(potentialCourses[j][currentIndexes[j]])

    const timetable = generateTimetable(selectedCourses, filter)

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

export function gogogogogo(courses: string[], filter: Filter) {
  resetResult()
  generateTimetables(queryCourses(courses), filter)

  return result
}

onmessage = function(e) {
  resetResult()

  const courseNames = JSON.parse(e.data[0]) as string[]
  const filter = JSON.parse(e.data[1]) as Filter
  const potentialCourses = queryCourses(courseNames)

  // Generate timetables if and only if number of potential courses and course names are the same
  if (potentialCourses.length === courseNames.length) {
    generateTimetables(potentialCourses, filter)

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
