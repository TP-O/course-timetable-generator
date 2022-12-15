import { DayOfWeek, LocalStorageKey, NotificationType, Time, Univerisity } from '@/enums'
import { MainLayout } from '@/layouts'
import { generateTimetables, getCourseGroups, getCourseNames } from '@/services'
import { TimetableType } from '@/types'
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  ChangeEvent,
  Fragment,
  KeyboardEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { TimetableList } from '@/components/table'
import { CourseFilter, LecturerFilter, WeekFilter } from '@/components/filter'
import { LazyData, NextPageWithLayout } from '@/types/component'
import { CourseFilterType, LecturerFilterType, WeekFilterType } from '@/types/filter'
import { AppContext } from '@/contexts'
import { ContentCopy } from '@mui/icons-material'
import { debounceTime, distinctUntilChanged, fromEvent } from 'rxjs'
import { Seo } from '@/components/common'
import sleep from 'await-sleep'

const Generation: NextPageWithLayout = () => {
  const { showNotification, load, unload } = useContext(AppContext)

  // Course searching
  const [selectedCoures, setSelectedCourse] = useState<String[]>([])
  const [courseFilter, setCourseFilter] = useState<CourseFilterType>({
    university: Univerisity.HCMIU,
    faculty: 'All',
  })
  const [recommededCourses, setRecommededCourses] = useState<String[]>([])

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
          message: 'Copied selected courses!',
          status: 'success',
        })
      )
      .catch(() =>
        showNotification({
          type: NotificationType.Snackbar,
          message: 'Unable to copy selected courses :(',
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

  // Load from here to prevent the fucking hydration error
  useEffect(() => {
    try {
      setSelectedCourse(JSON.parse(localStorage.getItem(LocalStorageKey.SelectedCourses) || '[]'))
    } catch {
      //
    }
  }, [])

  // Keyword tracking
  const keywordEl = useRef<HTMLInputElement>(null)

  // Handle multiple-courses input
  useEffect(() => {
    if (!keywordEl.current) return
    // Prevent redundant keyword changes
    const sub = fromEvent<ChangeEvent<HTMLInputElement>>(keywordEl.current, 'keyup')
      .pipe(debounceTime(250 * Time.Millisecond), distinctUntilChanged())
      .subscribe((event) => {
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
      })
    return () => sub.unsubscribe()
  }, [recommededCourses, selectedCoures])

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
  const [total, setTotal] = useState({ credits: 0, timetables: 0 })

  async function generateNewTimetables() {
    const courseGroups = await getCourseGroups(courseFilter.university, selectedCoures as string[])
    const cases = courseGroups.reduce((p, c) => p * c.length, 1)

    load(`${cases} case(s) are estimated!!! ${cases > 300_000 ? 'R.I.P your computer' : ''}`)
    await sleep(1000)

    const { timetables, credits } = generateTimetables(courseGroups, {
      week: weekFilter,
      lecturers: lecturerFilter,
    })

    if (!timetables.length) {
      unload()

      showNotification({
        type: NotificationType.Dialog,
        message: 'There is no timetable satisfying your ambition :(',
        status: 'success',
      })
    } else {
      setTotal({
        credits,
        timetables: timetables.length,
      })
      setTimetables({
        hide: timetables,
        show: timetables.splice(0, batchSize),
      })
    }
  }

  function loadMoreTimetables() {
    setTimetables((state) => {
      const showTimetables = [...state.show, ...state.hide.splice(0, batchSize)]

      return { ...state, show: showTimetables }
    })
  }

  useEffect(() => {
    // Only execute when new timetables are generated
    if (timetables.show.length > 0 && timetables.show.length <= batchSize) {
      unload()
      document.getElementById('generate-btn')?.scrollIntoView()
    }
  }, [timetables]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Fragment>
      <Seo
        title="Generator"
        description="Generate list of timetables based on the selected courses and powerful filters."
      />

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
                  inputRef={keywordEl}
                />
              )}
              sx={{ flexGrow: 1 }}
              onChange={updateSelectedCourses}
            />

            <IconButton sx={{ borderRadius: 0 }} onClick={copySelectedCourse}>
              <ContentCopy />
            </IconButton>
          </Stack>

          <CourseFilter
            filter={courseFilter}
            updateFilter={setCourseFilter}
            onUniversityChange={() => updateSelectedCourses(null, [])}
            cache
          />

          <Typography variant="caption" component="div" sx={{ pl: 1 }}>
            <b>Day off</b>
          </Typography>

          <WeekFilter filter={weekFilter} updateFilter={setWeekFilter} cache />

          <Typography
            variant="caption"
            component="div"
            data-title="Pick & Ban lecturers"
            data-intro={`
              Pick: Choose the lecturers you want to learn from 🧑‍🏫
              <br /><br />
              Ban: Choose the lecturers you <b>don't</b> want to learn from 🧑‍🏫`}
            sx={{ pl: 1 }}
          >
            <b>Lecturer</b> (Pick/Ban phase has a great effect on the score!!!)
          </Typography>

          <LecturerFilter
            cache
            filter={lecturerFilter}
            university={courseFilter.university}
            courses={selectedCoures as string[]}
            updateFilter={setLecturerFilter}
          />

          <Button id="generate-btn" variant="contained" onClick={generateNewTimetables}>
            Generate
          </Button>
        </Stack>

        {timetables.show.length > 0 && (
          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle>Info</AlertTitle>

            <List dense>
              <ListItem>
                <ListItemText>
                  Total credits: <b>{total.credits}</b>
                </ListItemText>
              </ListItem>
              <ListItem>
                <ListItemText>
                  Total timetables: <b>{total.timetables}</b>
                </ListItemText>
              </ListItem>
            </List>
          </Alert>
        )}

        {/* Display list of matched timetables */}
        <TimetableList
          id="timetable-list"
          length={timetables.hide.length}
          hasMore={timetables.hide.length > 0}
          timetables={timetables.show}
          loadMore={loadMoreTimetables}
        />
      </Stack>
    </Fragment>
  )
}

Generation.Layout = MainLayout
export default Generation
