import styles from '@/styles/Home.module.css'
import { MainLayout } from '@/layouts'
import { NextPageWithLayout } from '@/types'
import { useAuth } from '@/hooks'
import Link from 'next/link'
import { Button } from '@mui/material'

const About: NextPageWithLayout = () => {
  const { user, signIn, signOut } = useAuth()

  async function handleSignIn() {
    try {
      await signIn('hhehehe@gmail.com', 'asdsds')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className={styles.container}>
      <h1>About page</h1>
      <p>Hello {user?.email}</p>

      <button onClick={handleSignIn}>sign-in</button>
      <button onClick={signOut}>sign-out</button>
      <Link href="/">
        <a>Home</a>
      </Link>
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
    </div>
  )
}

About.Layout = MainLayout

export default About
