import { WeekFilterType } from '@/types/filter'
import { getDaysOfWeek } from '@/utils'
import { Checkbox, FormControl, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material'
import { ChangeEvent, Dispatch, SetStateAction } from 'react'

type WeekFilterProps = {
  filter: WeekFilterType
  updateFilter: Dispatch<SetStateAction<WeekFilterType>>
}

const daysOfWeek = getDaysOfWeek()
const guideTitle = 'Week filter'

export function WeekFilter({ filter, updateFilter }: WeekFilterProps) {
  function updateWeekFilter({ target: { name, value, checked } }: ChangeEvent<HTMLInputElement>) {
    const parsedValue = Number(value)

    if (name === 'days') {
      filter.days = parsedValue
    } else if (name === 'specificDays') {
      if (checked) {
        filter.specificDays.push(parsedValue)
      } else {
        const removedIndex = filter.specificDays.indexOf(parsedValue)

        if (removedIndex !== -1) {
          filter.specificDays.splice(removedIndex, 1)
        }
      }
    }

    updateFilter(() => ({ ...filter }))
  }

  return (
    <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
      <FormControl sx={{ width: { xs: '100%', md: '50%' } }}>
        <TextField
          name="days"
          label="Minimum days off"
          type="number"
          size="small"
          value={filter.days}
          InputProps={{
            inputProps: {
              min: 0,
              max: 6,
            },
          }}
          data-title={guideTitle}
          data-intro="Enter the minimum number of days off you want in your timetable 🌴"
          onChange={updateWeekFilter}
        />
      </FormControl>

      <FormControl sx={{ width: { xs: '100%', md: '50%' } }}>
        <FormGroup
          row
          sx={{ justifyContent: 'space-between', pl: 1.75 }}
          data-title={guideTitle}
          data-intro="If you want fixed days off in your timetable, use this ⛱️"
        >
          {daysOfWeek.map((day, i) => (
            <FormControlLabel
              key={i}
              control={
                <Checkbox
                  name="specificDays"
                  value={i}
                  checked={filter.specificDays.indexOf(i) > -1}
                  onChange={updateWeekFilter}
                />
              }
              label={day}
            ></FormControlLabel>
          ))}
        </FormGroup>
      </FormControl>
    </Stack>
  )
}
