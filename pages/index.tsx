import { Seo } from '@/components/common'
import { Path } from '@/enums'
import { NextPageWithLayout } from '@/types/component'
import { Avatar, Button, Stack } from '@mui/material'
import { useRouter } from 'next/router'
import { Fragment } from 'react'

const Home: NextPageWithLayout = () => {
  const router = useRouter()

  return (
    <Fragment>
      <Seo description="A website helps students in unveristy to select the most suitable timetable." />

      <Stack>
        <Avatar
          alt="welcome"
          src={Path.PepeWelcome}
          variant="square"
          sx={{ width: 224, height: 224, mb: 4 }}
        />

        <Button variant="contained" autoFocus onClick={() => router.push(Path.Main)}>
          Explore
        </Button>
      </Stack>
    </Fragment>
  )
}

export default Home
