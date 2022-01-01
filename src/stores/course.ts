import { acceptHMRUpdate, defineStore } from 'pinia'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<string[]>([])

  function syncFromLocalStorage() {
    const localData = localStorage.getItem('courses') || ''

    try {
      courses.value = JSON.parse(localData)
    }
    catch {
      courses.value = []
    }
  }

  function addCourse(course: string) {
    if (course !== '' && !courses.value.includes(course)) {
      courses.value.push(course)

      return true
    }

    return false
  }

  function removeCourse(identifier: number | string) {
    if (typeof identifier === 'string')
      identifier = courses.value.indexOf(identifier)

    if (identifier >= 0 && identifier < courses.value.length) {
      courses.value.splice(identifier, 1)

      return true
    }

    return false
  }

  syncFromLocalStorage()

  watchEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses.value))
  })

  return {
    courses,
    addCourse,
    removeCourse,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCourseStore, import.meta.hot))
