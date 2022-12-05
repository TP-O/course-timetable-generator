import { TimetableList } from '@/components/table'
import { LocalStorageKey } from '@/enums'
import { MainLayout } from '@/layouts'
import { TimetableType } from '@/types'
import { LazyData, NextPageWithLayout } from '@/types/component'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'

const Saved: NextPageWithLayout = () => {
  const batchSize = 5
  const [timetables, setTimetables] = useState<LazyData<TimetableType>>({
    hide: [],
    show: [],
  })

  function loadMoreTimetables() {
    setTimetables((timetables) => {
      const showTimetables = [...timetables.show, ...timetables.hide.splice(0, batchSize)]

      return { ...timetables, show: showTimetables }
    })
  }

  function onUnsaved(key: number) {
    setTimetables((timetables) => {
      timetables.show.splice(key, 1)

      return { ...timetables }
    })
  }

  useEffect(() => {
    try {
      const JSONSavedTimetables = localStorage.getItem(LocalStorageKey.SavedTimetables)

      if (JSONSavedTimetables) {
        const savedTimetables = JSON.parse(JSONSavedTimetables)

        setTimetables({
          hide: savedTimetables,
          show: savedTimetables.splice(0, batchSize),
        })
      }
    } catch {
      //
    }
  }, [])

  return (
    <Box sx={{ px: 2 }}>
      <TimetableList
        id="timetable-list"
        onUnsaved={onUnsaved}
        length={timetables.hide.length}
        hasMore={timetables.hide.length > 0}
        timetables={timetables.show}
        loadMore={loadMoreTimetables}
      />
    </Box>
  )
}

Saved.Layout = MainLayout

export default Saved
