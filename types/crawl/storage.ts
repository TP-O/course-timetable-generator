import { Univerisity } from '@/enums'
import { Course } from '../course'

export type UniversityStorage = Record<Univerisity, UniversityRecord | null>

export type UniversityRecord = {
  faculties: Record<string, FacultyRecord>
  courses: Record<string, Course[]>
  updatedAt?: Time
}

type Time = {
  text: string
  timestamp: number
}

export type FacultyRecord = {
  courses: Record<string, CourseRecord>
  lecturers: string[]
}

export type CourseRecord = {
  lecturers: string[]
}
