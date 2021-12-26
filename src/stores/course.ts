import { acceptHMRUpdate, defineStore } from 'pinia'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<string[]>(getFromLocalStorage())

  function getFromLocalStorage() {
    const localData = localStorage.getItem('courses') || ''

    try {
      return JSON.parse(localData) as string[]
    }
    catch {
      return []
    }
  }

  function syncWithLocalStorage() {
    localStorage.setItem('courses', JSON.stringify(courses.value))
  }

  function addCourse(course: string) {
    if (course !== '' && !courses.value.includes(course)) {
      courses.value.push(course)

      syncWithLocalStorage()

      return true
    }

    return false
  }

  function removeCourse(identifier: number | string) {
    if (typeof identifier === 'string')
      identifier = courses.value.indexOf(identifier)

    if (identifier >= 0 && identifier < courses.value.length) {
      courses.value.splice(identifier, 1)

      syncWithLocalStorage()

      return true
    }

    return false
  }

  return {
    courses,
    addCourse,
    removeCourse,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCourseStore, import.meta.hot))
