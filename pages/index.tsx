import { NextPageWithLayout } from '@/types/component'
import { useRouter } from 'next/router'
import { Url } from '@/enums'
import { useEffect } from 'react'

const Home: NextPageWithLayout = () => {
  const router = useRouter()

  useEffect(() => {
    router.push(Url.Main)
  })

  return (
    <div>
      <p>Home page</p>
    </div>
  )
}

export default Home
