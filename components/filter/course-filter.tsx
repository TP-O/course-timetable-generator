import { getFaculties, getUniversities } from '@/services'
import { CourseFilterType } from '@/types/filter'
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

type CourseFilterProps = {
  filter: CourseFilterType
  updateFilter: Dispatch<SetStateAction<CourseFilterType>>
}

const universities = getUniversities()

export function CourseFilter({ filter, updateFilter }: CourseFilterProps) {
  const [faculties, setFaculties] = useState<string[]>([])

  function updateCourseFilter(event: SelectChangeEvent) {
    updateFilter((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }))
  }

  useEffect(() => {
    ;(async () => {
      const faculties = await getFaculties(filter.university)
      setFaculties(faculties)
    })()
  }, [filter.university])

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
          onChange={updateCourseFilter}
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
