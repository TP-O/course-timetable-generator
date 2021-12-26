import { acceptHMRUpdate, defineStore } from 'pinia'

export const useLecturerstore = defineStore('lecturer', () => {
  const lecturers = ref<string[]>([])

  function syncWithLocalStorage() {
    localStorage.setItem('lecturers', JSON.stringify(lecturers.value))
  }

  function addLecturer(lecturer: string) {
    if (lecturer !== '' && !lecturers.value.includes(lecturer)) {
      lecturers.value.push(lecturer)

      syncWithLocalStorage()

      return true
    }

    return false
  }

  function removeLecturer(identifier: number | string) {
    if (typeof identifier === 'string')
      identifier = lecturers.value.indexOf(identifier)

    if (identifier >= 0 && identifier < lecturers.value.length) {
      lecturers.value.splice(identifier, 1)

      syncWithLocalStorage()

      return true
    }

    return false
  }

  return {
    lecturers,
    addLecturer,
    removeLecturer,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useLecturerstore, import.meta.hot))
