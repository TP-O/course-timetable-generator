import { DayOfWeek, Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import { getCourseNames, getLecturersOfCourse, getUniversities } from '@/services'
import { NextPageWithLayout, TimetableFilter } from '@/types'
import { convertDayNumberToDayString } from '@/utils'
import {
  Autocomplete,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { setFips } from 'crypto'
import { ChangeEvent, Fragment, useEffect, useState } from 'react'
import { from } from 'rxjs'

const universities = getUniversities()
const daysOfWeek = Object.keys(DayOfWeek).filter((value) => isNaN(Number(value)))

const Generation: NextPageWithLayout = () => {
  // Change university
  const [university, setUniversity] = useState<Univerisity>(Univerisity.HCMIU)

  function handleUniversity(event: SelectChangeEvent) {
    setUniversity(event.target.value as Univerisity)
  }

  // Course searching
  const [courseNames, setCourseNames] = useState<String[]>([])
  const [selectedCoureNames, setSelectedCourseNames] = useState<String[]>([])

  function handleSelectedCourseNames(_: any, value: String[]) {
    setSelectedCourseNames(value)
  }

  useEffect(() => {
    getCourseNames(university).then((courseNames) => setCourseNames(courseNames))
  }, [university])

  // Timetable filter
  const [filter, setFilter] = useState<TimetableFilter>({
    dayOff: {
      days: 1,
      specificDays: [DayOfWeek.Sun],
    },
    lecturer: {},
  })
  const [lecturersOfCourses, setLecturersOfCourses] = useState<
    Record<Univerisity, Record<string, string[]>>
  >({
    'HCMIU - International Univerisity': {},
    'UEH - University of Economics HCMC': {},
  })

  function handleChangeDayOffFilter(
    event: SelectChangeEvent<DayOfWeek[]> | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFilter(
      (filter) =>
        ({
          ...filter,
          dayOff: {
            ...filter.dayOff,
            [event.target.name]: event.target.value,
          },
        } as TimetableFilter)
    )
  }

  useEffect(() => {
    // Update lecturer filter
    setFilter((state) => {
      const newFilter = { ...state }
      const currentCourseNames = Object.keys(newFilter.lecturer!)

      // Add new courses
      selectedCoureNames.forEach((name) => {
        if (!currentCourseNames.includes(String(name))) {
          newFilter.lecturer![String(name)] = {
            expectations: [],
            unexpectations: [],
          }

          // Get new lecturer for new courses
          from(getLecturersOfCourse(university, String(name))).subscribe((lecturers) => {
            setLecturersOfCourses((state) => {
              if (state[university][String(name)] !== undefined) {
                return state
              }

              return {
                ...state,
                [university]: {
                  ...state[university],
                  [String(name)]: lecturers,
                },
              }
            })
          })
        }
      })

      // Remove courses
      currentCourseNames.forEach((name) => {
        if (!selectedCoureNames.includes(name)) {
          delete newFilter.lecturer![name]
        }
      })

      return newFilter
    })
  }, [selectedCoureNames, university])

  return (
    <Stack sx={{ px: 2, py: 5 }}>
      <Stack spacing={3}>
        <Autocomplete
          multiple
          options={courseNames}
          value={selectedCoureNames}
          renderInput={(params) => (
            <TextField {...params} label="Select courses" placeholder="Enter course name" />
          )}
          onChange={handleSelectedCourseNames}
        />

        <FormControl>
          <InputLabel id="university-selection-label" size="small">
            University
          </InputLabel>

          <Select
            name="university"
            labelId="university-selection-label"
            size="small"
            value={university}
            label="University"
            onChange={handleUniversity}
          >
            {universities.map((university) => (
              <MenuItem key={university} value={university}>
                {university}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Fragment>
          <Typography variant="caption" component="div" sx={{ pl: 1 }}>
            <b>Day off</b>
          </Typography>

          <Stack
            spacing={3}
            direction={{
              xs: 'column',
              md: 'row',
            }}
          >
            <FormControl
              sx={{
                width: {
                  xs: '100%',
                  md: '15%',
                },
              }}
            >
              <TextField
                name="days"
                label="Number of days"
                type="number"
                size="small"
                value={filter.dayOff?.days}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: 6,
                  },
                }}
                onChange={handleChangeDayOffFilter}
              />
            </FormControl>

            <FormControl
              sx={{
                width: {
                  xs: '100%',
                  md: '85%',
                },
              }}
            >
              <InputLabel id="daysoff-selection-label" size="small">
                Specific days
              </InputLabel>

              <Select
                name="specificDays"
                labelId="daysoff-selection-label"
                multiple
                size="small"
                value={filter.dayOff?.specificDays}
                onChange={handleChangeDayOffFilter}
                input={<OutlinedInput label="Specific days" />}
                renderValue={(selected: DayOfWeek[]) =>
                  selected.map((val) => convertDayNumberToDayString(val)).join(', ')
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                      width: 250,
                    },
                  },
                }}
              >
                {daysOfWeek.map((day, i) => (
                  <MenuItem key={i} value={i}>
                    <Checkbox checked={filter.dayOff!.specificDays!.indexOf(i) > -1} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Fragment>

        <Fragment>
          <Typography variant="caption" component="div" sx={{ pl: 1 }}>
            <b>Lecturer</b>
          </Typography>

          <Stack
            spacing={2}
            direction={{
              xs: 'column',
              sm: 'row',
            }}
          >
            {filter.lecturer &&
              Object.entries(filter.lecturer).map(([courseName, option], i) => (
                <Stack
                  key={courseName}
                  spacing={2}
                  sx={{
                    width: { xs: '100%', md: '30%', lg: '25%' },
                  }}
                >
                  <Typography variant="caption" component="div" sx={{ pl: 1 }}>
                    {courseName}
                  </Typography>

                  <FormControl>
                    <InputLabel id={`expected-lecturer-label-${i}`} size="small">
                      Expect
                    </InputLabel>
                    <Select
                      name={courseName}
                      multiple
                      labelId={`expected-lecturer-label-${i}`}
                      size="small"
                      value={filter.lecturer![courseName]?.expectations}
                      // onChange={handleChangeDayOffFilter}
                      input={<OutlinedInput label="Expect" />}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 224,
                            width: 250,
                          },
                        },
                      }}
                      sx={{ width: '100%' }}
                      renderValue={(selected: string[]) => selected.join(', ')}
                    >
                      {lecturersOfCourses[university][courseName] === undefined ||
                      lecturersOfCourses[university][courseName]?.length === 0 ? (
                        <MenuItem disabled>Nothing here</MenuItem>
                      ) : (
                        lecturersOfCourses[university][courseName].map((lecturer, i) => (
                          <MenuItem key={i} value={i}>
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
                      name={courseName}
                      multiple
                      label={`unexpected-lecturer-label-${i}`}
                      size="small"
                      value={filter.lecturer![courseName]?.unexpectations}
                      // onChange={handleChangeDayOffFilter}
                      input={<OutlinedInput label="Unexpect" />}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 224,
                            width: 250,
                          },
                        },
                      }}
                      sx={{ width: '100%' }}
                      renderValue={(selected: string[]) => selected.join(', ')}
                    >
                      {lecturersOfCourses[university][courseName] === undefined ||
                      lecturersOfCourses[university][courseName].length === 0 ? (
                        <MenuItem disabled>Nothing here</MenuItem>
                      ) : (
                        lecturersOfCourses[university][courseName].map((lecturer, i) => (
                          <MenuItem key={i} value={i}>
                            {lecturer}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Stack>
              ))}
          </Stack>
        </Fragment>
      </Stack>
    </Stack>
  )
}

Generation.Layout = MainLayout

export default Generation
