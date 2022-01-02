import { acceptHMRUpdate, defineStore } from 'pinia'
import { useCourseStore } from './course'
import type { Filter, FilterState } from '~/types'

export const useFilterStore = defineStore('filter', () => {
  const { courses } = useCourseStore()

  const filters = ref<Filter>({
    day: {
      numberOfRelaxationDays: 1,
      specificDays: [],
    },
    lecturer: {
      expected: {},
      unexpected: {},
    },
  })

  const filterState = ref<FilterState>({
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

      filters.value = filterData
      filterState.value = filterStateData
    }
    catch {
      //
    }
  }

  function updateSpecificDays(day: number, isInserted: boolean) {
    const index = filters.value.day.specificDays.indexOf(day)

    if (isInserted && index === -1)
      filters.value.day.specificDays.push(day)
    else if (!isInserted && index !== -1)
      filters.value.day.specificDays.splice(index, 1)

    return true
  }

  function addLecturer(lecturer: string, tag: string) {
    const [p, key] = tag.split('.')

    // Check if lecturer option exists
    if (!Object.keys(filters.value.lecturer).includes(p))
      return false

    const option = p as keyof typeof filters.value.lecturer

    // Create property if it does not exist
    if (filters.value.lecturer[option][key] === undefined)
      filters.value.lecturer[option][key] = []

    if (filters.value.lecturer[option][key].includes(lecturer))
      return false

    filters.value.lecturer[option][key].push(lecturer)

    return true
  }

  function removeLecturer(identifier: number | string, tag: string) {
    const [p, key] = tag.split('.')

    // Check if lecturer option exists
    if (!Object.keys(filters.value.lecturer).includes(p))
      return false

    const option = p as keyof typeof filters.value.lecturer

    // Property does not exist
    if (filters.value.lecturer[option][key] === undefined)
      return false

    // Convert identifier to number
    if (typeof identifier === 'string')
      identifier = filters.value.lecturer[option][key].indexOf(identifier)

    if (identifier < 0 || identifier >= filters.value.lecturer[option][key].length)
      return false

    filters.value.lecturer[option][key].splice(identifier, 1)

    // Delete property if it is empty
    if (filters.value.lecturer[option][key].length === 0)
      delete filters.value.lecturer[option][key]

    return true
  }

  function cleanFilter() {
    Object.keys(filters.value.lecturer.expected).forEach((key) => {
      if (!courses.includes(key))
        delete filters.value.lecturer.expected[key]
    })

    Object.keys(filters.value.lecturer.unexpected).forEach((key) => {
      if (!courses.includes(key))
        delete filters.value.lecturer.unexpected[key]
    })
  }

  // Load data from local storage
  syncFromLocalStorage()

  // Track data in store it to storage
  watchEffect(() => {
    localStorage.setItem('filter', JSON.stringify(filters.value))
    localStorage.setItem('filterState', JSON.stringify(filterState.value))
  })

  return {
    filters,
    filterState,
    updateSpecificDays,
    addLecturer,
    removeLecturer,
    cleanFilter,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useFilterStore, import.meta.hot))
