import { LocalStorageKey, Univerisity } from '@/enums'
import { getCourseLecturers } from '@/services'
import { LecturerFilterType } from '@/types/filter'
import { Cancel } from '@mui/icons-material'
import {
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

type LecturerFilterProps = {
  filter: LecturerFilterType
  cache: boolean
  university: Univerisity
  courses: string[]
  updateFilter: Dispatch<SetStateAction<LecturerFilterType>>
}

const guideTitle = 'Lecturer filter'

export function LecturerFilter({
  filter,
  university,
  courses,
  cache,
  updateFilter,
}: LecturerFilterProps) {
  const [lecturers, setLecturers] = useState<Record<string, string[]>>({})

  // Only apply for selection
  function updateLecturerFilter(course: string) {
    return (event: SelectChangeEvent<string[]>) => {
      if (!filter[course]) {
        filter[course] = {
          expectations: [],
          unexpectations: [],
        }
      }

      const newLecturers = Array.from(event.target.value)

      if (event.target.name === 'expectations') {
        filter[course].expectations = newLecturers
        // Unselect lecturers were being in expectations
        filter[course].unexpectations = filter[course].unexpectations.filter(
          (lecturer) => !newLecturers.includes(lecturer)
        )
      } else if (event.target.name === 'unexpectations') {
        filter[course].unexpectations = newLecturers
        // Unselect lecturers were being in unexpectations
        filter[course].expectations = filter[course].expectations.filter(
          (lecturer) => !newLecturers.includes(lecturer)
        )
      }

      updateFilter(() => {
        if (cache) {
          localStorage.setItem(LocalStorageKey.CachedLecturerFilter, JSON.stringify(filter))
        }

        return { ...filter }
      })
    }
  }

  function deleteLecturer(course: string, lecturer: string, key: keyof LecturerFilterType['']) {
    if (!filter[course]) {
      return
    }

    const deletedIndex = filter[course][key].indexOf(lecturer)

    if (deletedIndex === -1) {
      return
    }

    filter[course][key].splice(deletedIndex, 1)
    updateFilter(() => {
      if (cache) {
        localStorage.setItem(LocalStorageKey.CachedLecturerFilter, JSON.stringify(filter))
      }

      return { ...filter }
    })
  }

  useEffect(() => {
    ;(async () => {
      const oldCourses = Object.keys(lecturers)

      // Add lecturers of new courses
      for (const course of courses) {
        if (!oldCourses.includes(course)) {
          const newLecturers = await getCourseLecturers(university, course)
          lecturers[course] = newLecturers
        }
      }

      // Remove lecturers of deleted courses
      oldCourses.forEach((course) => {
        if (!courses.includes(course)) {
          delete lecturers[course]
        }
      })

      setLecturers({ ...lecturers })
    })()
  }, [university, courses]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cache) {
      const cachedFilterJSON = localStorage.getItem(LocalStorageKey.CachedLecturerFilter)

      if (cachedFilterJSON) {
        updateFilter(JSON.parse(cachedFilterJSON))
      }
    }
  }, [cache, updateFilter])

  return (
    <Box width="100%">
      <Grid container rowSpacing={3} columnSpacing={1}>
        {Object.entries(lecturers).map(([course, courseLecturers], i) => (
          <Grid key={course} item xs={12} md={6} lg={3}>
            <Stack spacing={2}>
              <Typography
                variant="subtitle2"
                component="div"
                sx={{
                  pl: 1,
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                }}
              >
                {course}
              </Typography>

              <FormControl
                data-title={!i ? guideTitle : ''}
                data-intro={!i ? 'Choose the lecturers you want to learn from 🧑‍🏫' : ''}
              >
                <InputLabel id={`expected-lecturer-label-${i}`} size="small">
                  Pick
                </InputLabel>
                <Select
                  name="expectations"
                  multiple
                  labelId={`expected-lecturer-label-${i}`}
                  size="small"
                  value={filter[course]?.expectations || []}
                  onChange={updateLecturerFilter(course)}
                  input={<OutlinedInput label="Expect" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          deleteIcon={<Cancel onMouseDown={(event) => event.stopPropagation()} />}
                          onDelete={() => deleteLecturer(course, value, 'expectations')}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                  sx={{ width: '100%' }}
                >
                  {!Array.isArray(courseLecturers) ? (
                    <MenuItem disabled>Nothing here</MenuItem>
                  ) : (
                    courseLecturers.map((lecturer, i) => (
                      <MenuItem key={i} value={lecturer}>
                        {lecturer}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <FormControl
                data-title={!i ? guideTitle : ''}
                data-intro={
                  !i ? "Choose the lecturers you <b>dont't</b> want to learn from 🧑‍🏫" : ''
                }
              >
                <InputLabel id={`unexpected-lecturer-label-${i}`} size="small">
                  Ban
                </InputLabel>
                <Select
                  name="unexpectations"
                  multiple
                  label={`unexpected-lecturer-label-${i}`}
                  size="small"
                  value={filter[course]?.unexpectations || []}
                  onChange={updateLecturerFilter(course)}
                  input={<OutlinedInput label="Unexpect" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          deleteIcon={<Cancel onMouseDown={(event) => event.stopPropagation()} />}
                          onDelete={() => {
                            deleteLecturer(course, value, 'unexpectations')
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                  sx={{ width: '100%' }}
                >
                  {!Array.isArray(courseLecturers) ? (
                    <MenuItem disabled>Nothing here</MenuItem>
                  ) : (
                    courseLecturers.map((lecturer, i) => (
                      <MenuItem key={i} value={lecturer}>
                        {lecturer}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
