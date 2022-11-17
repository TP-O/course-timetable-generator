import { DayOfWeek } from '@/enums'
import { TimetableFilter } from '@/types'
import { convertDayNumberToDayString, getDaysOfWeek } from '@/utils'
import {
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
} from '@mui/material'
import { ChangeEvent, Dispatch, SetStateAction } from 'react'

type WeekFilterProps = {
  filter: TimetableFilter['dayOff']
  updateFilter: Dispatch<SetStateAction<TimetableFilter['dayOff']>>
}

const daysOfWeek = getDaysOfWeek()

export function WeekFilter({ filter, updateFilter }: WeekFilterProps) {
  function updateWeekFilter(
    event: SelectChangeEvent<DayOfWeek[]> | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.target.name === 'days') {
      filter.days = Number(event.target.value)
    } else if (event.target.name === 'specificDays' && Array.isArray(event.target.value)) {
      filter.specificDays = event.target.value
    }

    updateFilter(() => ({ ...filter }))
  }

  return (
    <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
      <FormControl sx={{ width: { xs: '100%', md: '15%' } }}>
        <TextField
          name="days"
          label="Number of days"
          type="number"
          size="small"
          value={filter.days}
          InputProps={{
            inputProps: {
              min: 0,
              max: 6,
            },
          }}
          onChange={updateWeekFilter}
        />
      </FormControl>

      <FormControl sx={{ width: { xs: '100%', md: '85%' } }}>
        <InputLabel id="daysoff-selection-label" size="small">
          Specific days
        </InputLabel>

        <Select
          name="specificDays"
          labelId="daysoff-selection-label"
          multiple
          size="small"
          value={filter.specificDays}
          onChange={updateWeekFilter}
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
              <Checkbox checked={filter.specificDays.indexOf(i) > -1} />
              <ListItemText primary={day} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}
