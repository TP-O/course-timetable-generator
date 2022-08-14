import { Course, Timetable, TimetableFilter } from '@/types'
import sortedIndexBy from 'lodash/sortedIndexBy'
import cloneDeep from 'lodash/cloneDeep'

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

  const courses = courseGroups.splice(0, 1)[0]

  const incompleteTimetables = generateTimetablesWithCourseFilter(courseGroups, filter)
  const timetables: Timetable[] = []

  for (const incompleteTimetable of incompleteTimetables) {
    for (const course of courses) {
      if (!isValidCourse(course, filter) || isOverlapped(course, incompleteTimetable)) {
        continue
      }

      const cloneIncompleteTimetable = cloneDeep(incompleteTimetable)

      for (const lesson of course.lessons) {
        const newClass = {
          ...course,
          ...lesson,
        }

        // Add new class to day with order by begin property
        cloneIncompleteTimetable[lesson.day].splice(
          sortedIndexBy(cloneIncompleteTimetable[lesson.day], newClass, 'begin'),
          0,
          newClass
        )
      }

      timetables.push(cloneIncompleteTimetable)

      // console.log(cloneIncompleteTimetable)
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

    if (filter.lecturer?.[course.name] !== undefined) {
      if (filter.lecturer![course.name]!.expectations !== undefined) {
        for (const lecturer of filter.lecturer![course.name]!.expectations!) {
          if (!lesson.lecturers.includes(lecturer)) {
            return false
          }
        }
      }

      if (filter.lecturer![course.name]!.unexpectations !== undefined) {
        for (const lecturer of filter.lecturer![course.name]!.unexpectations!) {
          if (lesson.lecturers.includes(lecturer)) {
            return false
          }
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
