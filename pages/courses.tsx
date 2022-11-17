import { Time, Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import { getFaculties, getUniversityUpdatedTime } from '@/services'
import { CourseFilter, NextPageWithLayout, Timestamp } from '@/types'
import { Stack, TextField, Typography } from '@mui/material'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { debounceTime, distinctUntilChanged, fromEvent } from 'rxjs'
import date from 'date-and-time'
import { CourseTable } from '@/components/table'
import { CourseFilterComponent } from '@/components/filter'

const Courses: NextPageWithLayout = () => {
  // Perpare data
  const [updatedAt, setUpdatedAt] = useState<Timestamp>({
    second: 0,
    text: 'Unknown',
  })
  const [faculties, setFaculties] = useState<string[]>([])

  function checkOutdatedData() {
    return date.subtract(new Date(), new Date(updatedAt?.second || 0)).toDays() >= 90
  }

  // Course searching
  const keywordElt = useRef<HTMLInputElement>(null)
  const [keyword, setKeyword] = useState('')
  const [courseFilter, setCourseFilter] = useState<Omit<CourseFilter, 'keyword'>>({
    university: Univerisity.HCMIU,
    faculty: '',
  })

  useEffect(() => {
    ;(async () => {
      const updatedTime = await getUniversityUpdatedTime(courseFilter.university)
      const faculties = await getFaculties(courseFilter.university)
      setUpdatedAt(updatedTime)
      setFaculties(faculties)
    })()
  }, [courseFilter.university])

  useEffect(() => {
    // Prevent redundant keyword changes
    const sub = fromEvent<ChangeEvent<HTMLInputElement>>(keywordElt.current!, 'keyup')
      .pipe(debounceTime(250 * Time.Millisecond), distinctUntilChanged())
      .subscribe((event) => setKeyword(event.target.value))

    return () => sub.unsubscribe()
  }, [])

  return (
    <Stack spacing={3} sx={{ px: 2, py: 5 }}>
      {/* Searching */}
      <Stack spacing={4}>
        <TextField
          name="keyword"
          label="Search"
          size="small"
          variant="outlined"
          autoComplete="off"
          inputRef={keywordElt}
        />

        <CourseFilterComponent filter={courseFilter} updateFilter={setCourseFilter} />
      </Stack>

      {/* Display updated time */}
      {updatedAt !== undefined && (
        <Typography
          variant="caption"
          component="div"
          sx={{
            color: checkOutdatedData() ? 'red' : 'green',
            textAlign: 'right',
          }}
        >
          Updated at: {updatedAt.text}
        </Typography>
      )}

      {/* Display course tabe */}
      <CourseTable empty={faculties.length === 1} keyword={keyword} courseFilter={courseFilter} />
    </Stack>
  )
}

Courses.Layout = MainLayout

export default Courses
