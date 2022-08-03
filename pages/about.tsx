import { MainLayout } from '@/layouts'
import { NextPageWithLayout } from '@/types'
import styles from '@/styles/Home.module.css'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { firebaseClient } from '@/services/firebase/client'
import { useEffect } from 'react'
import { axiosClient } from '@/services/axios'
import useSWR from 'swr'

const About: NextPageWithLayout = () => {
  // useEffect(() => {
  //   ;(async () => {
  //     try {
  //       const userCredential = await signInWithEmailAndPassword(
  //         firebaseClient,
  //         'hhehehe@gmail.com',
  //         'asdsds'
  //       )

  //       console.log(userCredential)
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   })()
  // }, [])

  const { data, mutate } = useSWR('/timetables', {
    dedupingInterval: 2000,
  })

  const c = () => {
    mutate({ data: { name: 'aaaaaaaaaaaaaaaaaaaaaaaaaa' } }, true)
  }

  return (
    <div className={styles.container}>
      <h1>About page</h1>
      {data?.data.name}

      <button onClick={c}>aaa</button>
    </div>
  )
}

About.Layout = MainLayout

export default About
