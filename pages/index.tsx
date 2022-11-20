import { Url } from '@/enums'
import { NextPageWithLayout } from '@/types/component'
import { Avatar, Button, Stack } from '@mui/material'
import { useRouter } from 'next/router'

const Home: NextPageWithLayout = () => {
  const router = useRouter()

  return (
    <Stack>
      <Avatar
        alt="welcome"
        src={Url.PepeWelcome}
        variant="square"
        sx={{ width: 224, height: 224, mb: 4 }}
      />

      <Button variant="contained" autoFocus onClick={() => router.push(Url.Main)}>
        Explore
      </Button>
    </Stack>
  )
}

export default Home
