import { TimetableType } from '@/types'
import { Skeleton, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Timetable } from './timetable'

type TimetableListProps = {
  id?: string
  timetables: TimetableType[]
  length: number
  hasMore: boolean
  onUnsaved?: (key: number) => void
  loadMore: () => void
}

export function TimetableList({
  id,
  length,
  hasMore,
  timetables,
  loadMore,
  onUnsaved = () => {},
}: TimetableListProps) {
  return (
    <Box id={id ?? 'timetable-list'}>
      <InfiniteScroll
        dataLength={length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <Box mt={4}>
            <Stack direction="row" mb={1}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                sx={{ height: 30, width: 30, mx: 2 }}
              />
              <Skeleton animation="wave" variant="rectangular" sx={{ height: 30, width: 30 }} />
            </Stack>
            {[...Array(12)].map((_, key) => (
              <Skeleton
                key={key}
                animation="wave"
                variant="rectangular"
                sx={{ height: 30, mb: 0.5 }}
              />
            ))}
          </Box>
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
            <Timetable key={i} timetable={timetable} onUnsaved={onUnsaved} />
          ))}
        </div>
      </InfiniteScroll>
    </Box>
  )
}
