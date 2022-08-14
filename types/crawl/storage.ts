import { Univerisity } from '@/enums'
import { Course } from '../course'

export type UniversityStorage = Record<Univerisity, UniversityRecord | null>

export type UniversityRecord = {
  faculties: Record<string, FacultyRecord>
  courses: Record<string, CourseGroup>
  updatedAt?: Timestamp
}

export type Timestamp = {
  text: string
  second: number
}

export type FacultyRecord = {
  courses: Record<string, CourseRecord>
  lecturers: string[]
}

export type CourseRecord = {
  lecturers: string[]
}

export type CourseGroup = {
  items: Course[]
  lecturers: string[]
}
