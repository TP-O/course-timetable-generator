import { MainLayout } from '@/layouts'
import { NextPageWithLayout } from '@/types'
import { useEffect } from 'react'
import { searchCoursesByName } from '@/services'
import { Univerisity } from '@/enums'

const About: NextPageWithLayout = () => {
  useEffect(() => {
    ;(async () => {
      const courses = await searchCoursesByName({
        keyword: 'obj',
        university: Univerisity.HCMIU,
        faculty: 'IT - Computer Science & Engineering',
      })

      console.log(courses)
    })()
  }, [])

  return (
    <div>
      <p>About</p>
    </div>
  )
}

About.Layout = MainLayout

export default About
