import { Timetable } from '@/types'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import InfiniteScroll from 'react-infinite-scroll-component'
import { AloneTimetable } from './alone-timetable'

type TimetableListProps = {
  timetables: Timetable[]
  length: number
  hasMore: boolean
  loadMore: () => void
}

export function TimetableList({ length, hasMore, timetables, loadMore }: TimetableListProps) {
  return (
    <Box>
      <InfiniteScroll
        dataLength={length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <Typography
            variant="body2"
            component="div"
            sx={{
              textAlign: 'center',
              fontWeight: 500,
              mt: 2,
            }}
          >
            Scroll to see more...
          </Typography>
        }
        endMessage={
          <Typography
            variant="body2"
            component="div"
            sx={{
              textAlign: 'center',
              fontWeight: 500,
              mt: 2,
            }}
          >
            Yay! You have seen it all
          </Typography>
        }
      >
        {timetables.map((timetable, i) => (
          <AloneTimetable key={i} id={i} timetable={timetable} />
        ))}
      </InfiniteScroll>
    </Box>
  )
}
