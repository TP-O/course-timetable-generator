import { LocalStorageKey, Univerisity } from '@/enums'
import { getFaculties, getUniversities } from '@/services'
import { CourseFilterType } from '@/types/filter'
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

type CourseFilterProps = {
  filter: CourseFilterType
  cache: boolean
  updateFilter: Dispatch<SetStateAction<CourseFilterType>>
  onUniversityChange?: (event: SelectChangeEvent<Univerisity>) => void
}

const universities = getUniversities()
const guideTitle = 'Course filter'

export function CourseFilter({
  filter,
  cache,
  updateFilter,
  onUniversityChange,
}: CourseFilterProps) {
  const [faculties, setFaculties] = useState<string[]>([])

  function updateCourseFilter(event: SelectChangeEvent) {
    updateFilter((filter) => {
      const newFilter = {
        ...filter,
        [event.target.name]: event.target.value,
      }

      if (cache) {
        localStorage.setItem(LocalStorageKey.CachedCourseFilter, JSON.stringify(newFilter))
      }

      return newFilter
    })
  }

  useEffect(() => {
    ;(async () => {
      const faculties = await getFaculties(filter.university)
      setFaculties(faculties)
    })()
  }, [filter.university])

  useEffect(() => {
    if (cache) {
      const cachedFilterJSON = localStorage.getItem(LocalStorageKey.CachedCourseFilter)

      if (cachedFilterJSON) {
        updateFilter(JSON.parse(cachedFilterJSON))
      }
    }
  }, [cache, updateFilter])

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
      <FormControl fullWidth>
        <InputLabel id="university-selection-label" size="small">
          University
        </InputLabel>

        <Select
          name="university"
          labelId="university-selection-label"
          size="small"
          value={filter.university}
          label="University"
          data-title={guideTitle}
          data-intro="Select your univeristy 🏫"
          onChange={(event) => {
            updateCourseFilter(event)

            if (onUniversityChange) {
              onUniversityChange(event)
            }
          }}
        >
          {universities.map((university) => (
            <MenuItem key={university} value={university}>
              {university}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="faculty-selection-label" size="small">
          Faculty
        </InputLabel>

        <Select
          name="faculty"
          labelId="faculty-selection-label"
          size="small"
          value={filter.faculty}
          label="Faculty"
          data-title={guideTitle}
          data-intro="Select the faculty you belong to 📚"
          onChange={updateCourseFilter}
        >
          <MenuItem value="All">All</MenuItem>

          {faculties.map((faculty) => (
            <MenuItem key={faculty} value={faculty}>
              {faculty}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}
