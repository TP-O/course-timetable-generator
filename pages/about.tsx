import { MainLayout } from '@/layouts'
import { NextPageWithLayout } from '@/types'
import styles from '@/styles/Home.module.css'

const About: NextPageWithLayout = () => {
  return (
    <div className={styles.container}>
      <h1>About page</h1>
    </div>
  )
}

About.Layout = MainLayout

export default About
