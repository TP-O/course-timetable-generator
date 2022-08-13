import { DayOfWeek, Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import { getCourseNames, getUniversities } from '@/services'
import { NextPageWithLayout, TimetableFilter } from '@/types'
import { convertDayNumberToDayString } from '@/utils'
import {
  Autocomplete,
  Checkbox,
  FormControl,
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
import { ChangeEvent, useEffect, useState } from 'react'

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
  const [selectedCoureName, setSelectedCourseNames] = useState<String[]>([])

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
    lecturer: {
      expectation: {},
      unexpectation: {},
    },
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

  return (
    <Stack sx={{ px: 2, py: 5 }}>
      <Stack spacing={3}>
        <Autocomplete
          multiple
          options={courseNames}
          value={selectedCoureName}
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

        <Typography variant="caption" component="div" sx={{ pl: 1 }}>
          Day off
        </Typography>

        <Stack spacing={3} direction="row">
          <FormControl
            sx={{
              width: {
                xs: '50%',
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

          <FormControl sx={{ flexGrow: 1 }}>
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
      </Stack>
    </Stack>
  )
}

Generation.Layout = MainLayout

export default Generation
