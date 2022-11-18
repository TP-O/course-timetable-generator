import { Univerisity } from '@/enums'
import { Course } from '../course'

export type Timestamp = {
  /**
   * Represent time as text format.
   */
  text: string

  /**
   * Represent time as seconds format.
   */
  seconds: number
}

export type FacultyRecord = {
  /**
   * All lecturers in the faculty.
   */
  lecturers: string[]

  /**
   * Lecturers of one course.
   */
  courseLecturers: Record<string, string[]>
}

export type CourseRecord = {
  /**
   * All course details.
   */
  items: Course[]

  /**
   * All lecturers of this course.
   */
  lecturers: string[]
}

export type UniversityRecord = {
  /**
   * All faculties are keys and their lecturers
   * are values.
   */
  faculties: Record<string, FacultyRecord>

  /**
   * All course names are keys and their details
   * are values.
   */
  courses: Record<string, CourseRecord>

  /**
   * Time when the university record is updated.
   */
  updatedAt: Timestamp
}

export type UniversityStorage = Record<Univerisity, UniversityRecord | undefined>
