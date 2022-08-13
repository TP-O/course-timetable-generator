import { Course, Timetable, TimetableFilter } from '@/types'
import sortedIndexBy from 'lodash/sortedIndexBy'

export function generateTimetables(courseGroups: Course[][], filter = {} as TimetableFilter) {
  return generateTimetablesWithCourseFilter(courseGroups, filter).filter((timetable) =>
    isValidTimetable(timetable, filter)
  )
}

function generateTimetablesWithCourseFilter(courseGroups: Course[][], filter: TimetableFilter) {
  if (courseGroups.length === 0) {
    // Empty array of timetables
    return [[[], [], [], [], [], [], []]]
  }

  const timetables: Timetable[] = []
  const courses = courseGroups.splice(0, 1)[0]
  const incompleteTimetables = generateTimetables(courseGroups, filter)

  for (const course of courses) {
    if (!isValidCourse(course, filter)) {
      break
    }

    for (const incompleteTimetable of incompleteTimetables) {
      if (!isOverlapped(course, incompleteTimetable)) {
        for (const lesson of course.lessons) {
          const newClass = {
            ...course,
            ...lesson,
          }

          // Add new class to day with order by begin property
          incompleteTimetable[lesson.day].splice(
            sortedIndexBy(incompleteTimetable[lesson.day], newClass, 'begin'),
            0,
            newClass
          )
        }
      }
    }
  }

  return timetables
}

function isOverlapped(course: Course, timetable: Timetable) {
  for (const day of timetable) {
    for (const classs of day) {
      for (const lesson of course.lessons) {
        if (
          classs.day === lesson.day &&
          classs.begin <= lesson.begin &&
          classs.begin + classs.periods - 1 >= lesson.begin
        ) {
          return true
        }
      }
    }
  }

  return false
}

function isValidCourse(course: Course, filter: TimetableFilter) {
  for (const lesson of course.lessons) {
    if (filter.dayOff?.specificDays !== undefined) {
      if (filter.dayOff.specificDays.includes(lesson.day)) {
        return false
      }
    }

    if (filter.lecturer?.expectation !== undefined) {
      for (const lecturer of filter.lecturer.expectation[course.name]) {
        if (!lesson.lecturers.includes(lecturer)) {
          return false
        }
      }
    }

    if (filter.lecturer?.unexpectation !== undefined) {
      for (const lecturer of filter.lecturer.unexpectation[course.name]) {
        if (lesson.lecturers.includes(lecturer)) {
          return false
        }
      }
    }
  }

  return true
}

function isValidTimetable(timetable: Timetable, filter: TimetableFilter) {
  if (filter.dayOff?.days !== undefined) {
    const numberOfdaysOff = timetable.reduce((p, c) => (c.length === 0 ? p + 1 : p), 0)

    if (numberOfdaysOff < filter.dayOff.days) {
      return false
    }
  }

  return true
}
