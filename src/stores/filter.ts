import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Filter, FilterState } from '~/types'
import { LecturerType } from '~/types'

export const useFilterStore = defineStore('filter', () => {
  let filters = reactive<Filter>({
    day: {
      numberOfRelaxationDays: 1,
      specificDays: [],
    },
    lecturer: {
      expected: [],
      unexpected: [],
    },
  })

  let filterState = reactive<FilterState>({
    specificDays: [
      { name: 'Mon', selected: false },
      { name: 'Tue', selected: false },
      { name: 'Wed', selected: false },
      { name: 'Thu', selected: false },
      { name: 'Fri', selected: false },
      { name: 'Sat', selected: false },
      { name: 'Sun', selected: false },
    ],
  })

  function syncFromLocalStorage() {
    const filterLocalData = localStorage.getItem('filter') || ''
    const filterStateLocalData = localStorage.getItem('filterState') || ''

    try {
      const filterData = JSON.parse(filterLocalData)
      const filterStateData = JSON.parse(filterStateLocalData)

      filters = reactive<Filter>(filterData)
      filterState = reactive<FilterState>(filterStateData)
    }
    catch {
      //
    }
  }

  function updateSpecificDays(day: number, isInserted: boolean) {
    if (!filters.day.specificDays)
      return false

    const index = filters.day.specificDays.indexOf(day)

    if (isInserted && index === -1)
      filters.day.specificDays.push(day)
    else if (!isInserted && index !== -1)
      filters.day.specificDays.splice(index, 1)

    return true
  }

  function addLecturer(lecturer: string, type = LecturerType.UNEXPECTED) {
    if (lecturer === '')
      return false

    if (type === LecturerType.EXPECTED && !filters.lecturer.expected.includes(lecturer))
      filters.lecturer.expected.push(lecturer)
    else if (type === LecturerType.UNEXPECTED && !filters.lecturer.unexpected.includes(lecturer))
      filters.lecturer.unexpected.push(lecturer)
    else
      return false

    return true
  }

  function removeLecturer(identifier: number | string, type = LecturerType.UNEXPECTED) {
    if (typeof identifier === 'string') {
      if (type === LecturerType.EXPECTED)
        identifier = filters.lecturer.expected.indexOf(identifier)
      else
        identifier = filters.lecturer.unexpected.indexOf(identifier)
    }

    if (identifier < 0)
      return false

    if (type === LecturerType.EXPECTED && identifier < filters.lecturer.expected.length)
      filters.lecturer.expected.splice(identifier, 1)
    else if (type === LecturerType.UNEXPECTED && identifier < filters.lecturer.unexpected.length)
      filters.lecturer.unexpected.splice(identifier, 1)
    else
      return false

    return true
  }

  syncFromLocalStorage()

  watchEffect(() => {
    localStorage.setItem('filter', JSON.stringify(filters))
    localStorage.setItem('filterState', JSON.stringify(filterState))
  })

  return {
    filters,
    filterState,
    updateSpecificDays,
    addLecturer,
    removeLecturer,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useFilterStore, import.meta.hot))
