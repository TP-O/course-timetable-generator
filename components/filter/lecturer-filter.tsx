import { Univerisity } from '@/enums'
import { getLecturersOfCourse } from '@/services'
import { TimetableFilter } from '@/types'
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
  filter: TimetableFilter['lecturer']
  university: Univerisity
  courses: string[]
  updateFilter: Dispatch<SetStateAction<TimetableFilter['lecturer']>>
}

export function LecturerFilter({ filter, university, courses, updateFilter }: LecturerFilterProps) {
  const [lecturers, setLecturers] = useState<Record<string, Record<string, string[]>>>({})

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

      updateFilter({ ...filter })
    }
  }

  function deleteLecturer(
    course: string,
    lecturer: string,
    key: keyof TimetableFilter['lecturer']['']
  ) {
    if (!filter[course]) {
      return
    }

    const deletedIndex = filter[course][key].indexOf(lecturer)

    if (deletedIndex === -1) {
      return
    }

    filter[course][key].splice(deletedIndex, 1)
    updateFilter({ ...filter })
  }

  useEffect(() => {
    setLecturers((lecturers) => {
      if (!lecturers[university]) {
        lecturers[university] = {}
      }

      const oldCourses = Object.keys(lecturers[university])

      // Add lecturers of new courses
      courses.forEach((course) => {
        if (!oldCourses.includes(course)) {
          getLecturersOfCourse(university, course).then((newLecturers) => {
            lecturers[university][course] = newLecturers
          })
        }
      })

      // Remove lecturers of deleted courses
      oldCourses.forEach((course) => {
        if (!courses.includes(course)) {
          delete lecturers[university][course]
        }
      })

      return { ...lecturers }
    })
  }, [university, courses])

  return (
    <Box width="100%">
      <Grid container rowSpacing={3} columnSpacing={1}>
        {lecturers[university] &&
          Object.entries(lecturers[university]).map(([course, courseLecturers], i) => (
            <Grid key={course} item xs={12} md={6} lg={3}>
              <Stack spacing={2}>
                <Typography
                  variant="caption"
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

                <FormControl>
                  <InputLabel id={`expected-lecturer-label-${i}`} size="small">
                    Expect
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
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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

                <FormControl>
                  <InputLabel id={`unexpected-lecturer-label-${i}`} size="small">
                    Unexpect
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
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
