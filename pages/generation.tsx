import { DayOfWeek, LocalStorageKey, NotificationType, Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import { generateTimetables, getCourseGroups, getCourseNames } from '@/services'
import { TimetableType } from '@/types'
import { Autocomplete, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import { KeyboardEvent, useContext, useEffect, useState } from 'react'
import { TimetableList } from '@/components/table'
import { CourseFilter, LecturerFilter, WeekFilter } from '@/components/filter'
import { LazyData, NextPageWithLayout } from '@/types/component'
import { CourseFilterType, LecturerFilterType, WeekFilterType } from '@/types/filter'
import { AppContext } from '@/contexts'
import { ContentCopy } from '@mui/icons-material'

const Generation: NextPageWithLayout = () => {
  const { showNotification, load, unload } = useContext(AppContext)

  // Course searching
  const [selectedCoures, setSelectedCourse] = useState<String[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LocalStorageKey.SelectedCourses) || '[]')
    } catch {
      return []
    }
  })
  const [courseFilter, setCourseFilter] = useState<CourseFilterType>({
    university: Univerisity.HCMIU,
    faculty: 'All',
  })
  const [recommededCourses, setRecommededCourses] = useState<String[]>([])

  function handleComplexCourseInput(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      const parsedValue = event.target.value.split(',')

      if (parsedValue.length < 2) {
        return
      }

      const validCourses: String[] = []

      parsedValue.forEach((val) => {
        if (recommededCourses.includes(val) && !selectedCoures.includes(val)) {
          validCourses.push(val)
        }
      })

      if (validCourses.length) {
        setSelectedCourse((courses) => [...courses, ...validCourses])
      }
    }
  }

  function updateSelectedCourses(_: any, value: String[]) {
    setSelectedCourse(value)
    localStorage.setItem(LocalStorageKey.SelectedCourses, JSON.stringify(value))
  }

  function copySelectedCourse() {
    navigator.clipboard
      .writeText(selectedCoures.join(','))
      .then(() =>
        showNotification({
          type: NotificationType.Snackbar,
          message: 'Captured timetable!',
          status: 'success',
        })
      )
      .catch(() =>
        showNotification({
          type: NotificationType.Snackbar,
          message: 'Unable to capture timetable :(',
          status: 'error',
        })
      )
  }

  useEffect(() => {
    ;(async () => {
      const courseNames = await getCourseNames(courseFilter.university, courseFilter.faculty)
      setRecommededCourses(courseNames)
    })()
  }, [courseFilter])

  // Timetable filter
  const [weekFilter, setWeekFilter] = useState<WeekFilterType>({
    days: 1,
    specificDays: [DayOfWeek.Sun],
  })
  const [lecturerFilter, setLecturerFilter] = useState<LecturerFilterType>({
    //
  })

  // Generate timetables
  const batchSize = 5
  const [timetables, setTimetables] = useState<LazyData<TimetableType>>({
    hide: [],
    show: [],
  })

  async function generateNewTimetables() {
    load()

    const courseGroups = await getCourseGroups(courseFilter.university, selectedCoures as string[])
    const timetables = generateTimetables(courseGroups, {
      week: weekFilter,
      lecturers: lecturerFilter,
    })

    if (!timetables.length) {
      showNotification({
        type: NotificationType.Dialog,
        message: 'There is no timetable satisfying your ambition :(',
        status: 'success',
      })
    }

    setTimetables({
      hide: timetables,
      show: timetables.splice(0, batchSize),
    })
  }

  function loadMoreTimetables() {
    setTimetables((state) => {
      const showTimetables = [...state.show, ...state.hide.splice(0, batchSize)]

      return { ...state, show: showTimetables }
    })
  }

  useEffect(() => {
    // Only execute when new timetables are generated
    if (timetables.show.length <= batchSize) {
      unload()
      document.getElementById('timetable-list')?.scrollIntoView()
    }
  }, [timetables]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack sx={{ px: 2, py: 5 }}>
      <Stack spacing={3}>
        <Stack direction="row">
          <Autocomplete
            multiple
            options={recommededCourses}
            value={selectedCoures}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select courses"
                placeholder="Enter course name"
                onKeyDown={handleComplexCourseInput}
              />
            )}
            sx={{ flexGrow: 1 }}
            onChange={updateSelectedCourses}
          />

          <IconButton sx={{ borderRadius: 0 }} onClick={copySelectedCourse}>
            <ContentCopy />
          </IconButton>
        </Stack>

        <CourseFilter filter={courseFilter} updateFilter={setCourseFilter} />

        <Typography variant="caption" component="div" sx={{ pl: 1 }}>
          <b>Day off</b>
        </Typography>

        <WeekFilter filter={weekFilter} updateFilter={setWeekFilter} />

        <Typography variant="caption" component="div" sx={{ pl: 1 }}>
          <b>Lecturer</b>
        </Typography>

        <LecturerFilter
          filter={lecturerFilter}
          university={courseFilter.university}
          courses={selectedCoures as string[]}
          updateFilter={setLecturerFilter}
        />

        <Button variant="contained" onClick={generateNewTimetables}>
          Generate
        </Button>
      </Stack>

      {/* Display list of matched timetables */}
      <TimetableList
        id="timetable-list"
        length={timetables.hide.length}
        hasMore={timetables.hide.length > 0}
        timetables={timetables.show}
        loadMore={loadMoreTimetables}
      />
    </Stack>
  )
}

Generation.Layout = MainLayout

export default Generation
