import { Path } from '@/enums'
import { NextPageWithLayout } from '@/types/component'
import { Avatar, Button, Stack } from '@mui/material'
import { useRouter } from 'next/router'

const Home: NextPageWithLayout = () => {
  const router = useRouter()

  return (
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
  )
}

export default Home
