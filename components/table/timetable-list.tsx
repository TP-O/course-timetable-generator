import { TimetableType } from '@/types'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Timetable } from './timetable'

type TimetableListProps = {
  id?: string
  timetables: TimetableType[]
  length: number
  hasMore: boolean
  loadMore: () => void
}

export function TimetableList({ id, length, hasMore, timetables, loadMore }: TimetableListProps) {
  return (
    <Box id={id ?? 'timetable-list'}>
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
          timetables.length ? (
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
          ) : null
        }
      >
        <div>
          {timetables.map((timetable, i) => (
            <Timetable key={i} id={i} timetable={timetable} />
          ))}
        </div>
      </InfiniteScroll>
    </Box>
  )
}
