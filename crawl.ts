/* eslint-disable no-console */
import { env } from 'process'
import { writeFileSync } from 'fs'
import type { WebDriver } from 'selenium-webdriver'
import { Builder, By, until } from 'selenium-webdriver'
import { config } from 'dotenv'
import find from 'lodash/find'
import type { PartialCourse } from '~/types'

config({
  path: './env.crawl.local',
})

function store(courses: any, lecturers: any, lecturersWithMajor: any, courseDetails: any) {
  writeFileSync('src/data/courses-searching.json', JSON.stringify(courses))
  // writeFileSync('src/data/lecturers-searching.json', JSON.stringify(lecturers))
  writeFileSync('src/data/lecturers-with-major-searching.json', JSON.stringify(lecturersWithMajor))
  writeFileSync('src/data/course-details.json', JSON.stringify(courseDetails))
}

function convertDayStringToDayNumber(day: string) {
  switch (day) {
    case 'Hai':
    case 'Mon':
      return 0
    case 'Ba':
    case 'Tue':
      return 1
    case 'Tư':
    case 'Wed':
      return 2
    case 'Năm':
    case 'Thu':
      return 3
    case 'Sáu':
    case 'Fri':
      return 4
    case 'Bảy':
    case 'Sat':
      return 5
    default:
      return 6
  }
}

(async() => {
  const driver = await new Builder().forBrowser('firefox').build()

  try {
    // Login
    await driver.get('https://edusoftweb.hcmiu.edu.vn/')

    await driver
      .findElement(By.id('ctl00_ContentPlaceHolder1_ctl00_ucDangNhap_txtTaiKhoa'))
      .sendKeys(String(env.EDUSOFT_USERNAME))
    await driver
      .findElement(By.id('ctl00_ContentPlaceHolder1_ctl00_ucDangNhap_txtMatKhau'))
      .sendKeys(String(env.EDUSOFT_PASSWORD))
    await driver
      .findElement(By.id('ctl00_ContentPlaceHolder1_ctl00_ucDangNhap_btnDangNhap'))
      .click()

    // Start to crawl
    await driver.get('https://edusoftweb.hcmiu.edu.vn/Default.aspx?page=dkmonhoc')
    driver.executeScript('document.getElementById("ctl00_ContentPlaceHolder1_ctl00_pnlThongbao").remove()').catch(() => null)
    await driver.wait(until.elementLocated(By.id('selectKhoa')))

    const courses: string[] = []
    const lecturers: string[] = []
    const lecturersWithMajor: Record<string, string[]> = {}
    const courseDetails: Record<string, PartialCourse[][]> = {}
    // Except first and last two elements
    const majors = await driver.findElements(
      By.css('#selectKhoa option:not(:first-child):not(:nth-last-child(2)):not(:last-child)'))

    await majors.reduce(async(pre, major) => {
      await pre

      // Load all courses of the major
      await major.click()
      await driver.wait<boolean>(async(webdriver: WebDriver) => {
        return (await webdriver.executeScript('return document.body.style.cursor')) === 'default'
      })

      const coursesOfMajor = await driver.findElements(By.css('#divTDK > table'))

      for (const course of coursesOfMajor) {
        const slots = parseInt(await course.findElement(By.css('tr > td:nth-child(10)')).getText())

        if (slots <= 0) continue

        const courseId = await course.findElement(By.css('tr > td:nth-child(2)')).getText()
        const classId = await course.findElement(By.css('tr > td:nth-child(9)')).getText()
        const name = (await course.findElement(By.css('tr > td:nth-child(4)')).getText()).slice(1)
        const credits = parseInt(await course.findElement(By.css('tr > td:nth-child(7)')).getText())
        const daysOfWeek = (await course.findElement(By.css('tr > td:nth-child(13)'))
          .getText())
          .split('\n ')
          .map(d => convertDayStringToDayNumber(d))
        const starts = (await course.findElement(By.css('tr > td:nth-child(14)'))
          .getText())
          .split('\n ')
          .map(s => parseInt(s))
        const periods = (await course.findElement(By.css('tr > td:nth-child(15)'))
          .getText())
          .split('\n ')
          .map(e => parseInt(e))
        const rooms = (await course.findElement(By.css('tr > td:nth-child(16)'))
          .getText())
          .split('\n ')
        const lecturersOfCourse = (await course.findElement(By.css('tr > td:nth-child(17)'))
          .getText())
          .split('\n ')

        const numberOfPartialCourses = daysOfWeek.length
        const partialCourses: PartialCourse[] = []

        for (let i = 0; i < numberOfPartialCourses; i++) {
          let similarIndexOfPartialCourses = -1
          let similarIndexOfCourse = -1

          for (let j = 0; j < partialCourses.length; j++) {
            if (partialCourses[j].start === starts[i]
            && partialCourses[j].period === periods[i]) {
              similarIndexOfPartialCourses = j
              similarIndexOfCourse = i

              break
            }
          }

          if (similarIndexOfPartialCourses !== -1 && isNaN(starts[similarIndexOfCourse])) {
            partialCourses[similarIndexOfPartialCourses].lecturer += `, ${lecturersOfCourse[i]}`
          }
          else {
            partialCourses.push({
              courseId,
              classId,
              name,
              credits,
              slots,
              dayOfWeek: daysOfWeek[i],
              start: starts[i],
              period: periods[i],
              room: rooms[i],
              lecturer: lecturersOfCourse[i],
            })
          }
        }

        if (!courses.includes(name))
          courses.push(name)

        // for (const lecturer of lecturersOfCourse) {
        //   if (lecturer !== '' && !lecturers.includes(lecturer))
        //     lecturers.push(lecturer)
        // }

        if (!Object.keys(lecturersWithMajor).includes(name))
          lecturersWithMajor[name] = []

        if (!Object.keys(courseDetails).includes(name))
          courseDetails[name] = []

        partialCourses.forEach((course) => {
          const lecturer = course.room?.includes('LA')
            ? `${course.lecturer} (Lab)`
            : course.lecturer

          if (!lecturersWithMajor[name].includes(lecturer))
            lecturersWithMajor[name].push(lecturer)
        })

        if (!find(courseDetails[name], o => JSON.stringify(o) === JSON.stringify(partialCourses)))
          courseDetails[name].push(partialCourses)
      }
    }, Promise.resolve())

    // Save to json files
    store(courses, lecturers, lecturersWithMajor, courseDetails)
  }
  catch (err) {
    console.log(err)
  }
  finally {
    await driver.quit()
  }
})()
