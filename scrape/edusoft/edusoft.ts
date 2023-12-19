import some from 'lodash/some'
import { Course, Lesson } from '@/types'
import { convertDayStringToDayNumber } from '@/utils'
import { Scraper, ScraperDetails } from '@/types/scrape'
import { UniversityRecord } from '@/types/storage'
import { ElementHandle, Page } from 'puppeteer'

export abstract class EdusoftScraper implements Scraper {
  constructor(readonly page: Page, readonly details: ScraperDetails) {}
  async signIn() {
    await this.page.goto(this.details.host + this.details.signInPath)
    await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_ucDangNhap_txtTaiKhoa')
    await this.page.type(
      '#ContentPlaceHolder1_ctl00_ucDangNhap_txtTaiKhoa',
      this.details.credentials.username
    )
    await this.page.type(
      '#ContentPlaceHolder1_ctl00_ucDangNhap_txtMatKhau',
      this.details.credentials.password
    )
    await this.page.click('#ContentPlaceHolder1_ctl00_ucDangNhap_btnDangNhap')

    // await new Promise((resolve) => {
    //   setTimeout(() => resolve(null), 999999999);
    // })

    console.log('Logged in!')
  }

  async scrape() {
    await this.signIn()
    await this.page.waitForSelector('#Header1_Logout1_lblNguoiDung')
    await this.page.goto(this.details.host + this.details.coursePath)
    await this.page.waitForSelector('#selectKhoa')

    console.log('Starting scraping...')

    const universityRecord: UniversityRecord = {
      faculties: {},
      courses: {},
      updatedAt: {
        seconds: 0,
        text: 'Unknown',
      },
    }
    const facultySelection = await this.page.$('#selectKhoa')
    if (!facultySelection) {
      return null
    }

    const faculties = await facultySelection.$$eval(
      'option:not(:first-child):not(:nth-last-child(2)):not(:last-child)',
      (els) =>
        els.map((el) => ({
          name: String(el.textContent),
          value: String(el.getAttribute('value')),
        }))
    )

    for (const faculty of faculties) {
      console.log(`Scraping [${faculty.name}]`)

      await facultySelection.select(faculty.value)
      const res = await this.page.waitForResponse(
        'https://edusoftweb.hcmiu.edu.vn/ajaxpro/EduSoft.Web.UC.DangKyMonHoc,EduSoft.Web.ashx'
      )

      // Log-in conflict
      if (
        (await res.text()).includes(
          '{"error":{"Message":"Object reference not set to an instance of an object."'
        )
      ) {
        return null
      }

      // Load all courses of the faculty
      await this.page.type('#txtMaMH1', ' ')
      await this.page.click('#btnLocTheoMaMH1')

      // Wait for data loading
      await this.page.waitForFunction('document.body.style.cursor === "default"')

      // Load the fucking table rows like a table =))
      const courseTableRows = await this.page.$$('#divTDK > table')

      universityRecord.faculties[faculty.name] = {
        lecturers: [],
        courseLecturers: {},
      }

      for (const courseRow of courseTableRows) {
        const capacity = parseInt(
          (await courseRow.$eval('tr > td:nth-child(10)', (el) => el.textContent)) || '0'
        )

        // Skip if class is unavailable
        if (capacity <= 0) {
          continue
        }

        const course = await this.filterCourse(courseRow)

        // Declare course of faculty if does not exist
        if (!universityRecord.faculties[faculty.name].courseLecturers[course.name]) {
          universityRecord.faculties[faculty.name].courseLecturers[course.name] = []
        }

        // Declare course of record if does not exist
        if (!universityRecord.courses[course.name]) {
          universityRecord.courses[course.name] = {
            items: [],
            lecturers: [],
          }
        }

        // Add new course to record
        if (
          !some(
            universityRecord.courses[course.name].items,
            (e) => JSON.stringify(e) === JSON.stringify(course)
          )
        ) {
          universityRecord.courses[course.name].items.push(course)
        }

        // Add new lecturers to faculty's lecturer, course's lecturer list
        // and course group's lecturer
        course.lessons.forEach((lesson) => {
          lesson.lecturers.forEach((lecturer) => {
            if (!universityRecord.faculties[faculty.name].lecturers.includes(lecturer)) {
              universityRecord.faculties[faculty.name].lecturers.push(lecturer)
            }

            if (
              !universityRecord.faculties[faculty.name].courseLecturers[course.name].includes(
                lecturer
              )
            ) {
              universityRecord.faculties[faculty.name].courseLecturers[course.name].push(lecturer)
            }

            if (!universityRecord.courses[course.name].lecturers.includes(lecturer)) {
              universityRecord.courses[course.name].lecturers.push(lecturer)
            }
          })
        })
      }
    }

    return universityRecord
  }

  async filterCourse(courseRow: ElementHandle<Element>) {
    const code = await courseRow.$eval('tr > td:nth-child(1) > input', (el) =>
      el.getAttribute('value')
    )
    const id = await courseRow.$eval('tr > td:nth-child(2)', (el) => el.textContent)
    const name = (await courseRow.$eval('tr > td:nth-child(4)', (el) => el.textContent))!.slice(1)
    const credits = parseInt(
      (await courseRow.$eval('tr > td:nth-child(7)', (el) => el.textContent)) || '0'
    )
    const classId = await courseRow.$eval('tr > td:nth-child(9)', (el) => el.textContent)
    const capacity = parseInt(
      (await courseRow.$eval('tr > td:nth-child(10)', (el) => el.textContent)) || '0'
    )

    // These data belong to lesson object and they have the same array length.
    // Each index corresponding to data of one lesson, but these data can be combined
    // into one lesson in some special cases.

    const daysOfWeek = (
      await courseRow.$$eval('tr > td:nth-child(13) > .top-fline', (els) =>
        els.map((el) => el.textContent)
      )
    ).map((dayStr) => convertDayStringToDayNumber(dayStr || ''))
    const begins = await courseRow.$$eval('tr > td:nth-child(14) > .top-fline', (els) =>
      els.map((el) => parseInt(el.textContent || '0'))
    )
    const periods = await courseRow.$$eval('tr > td:nth-child(15) > .top-fline', (els) =>
      els.map((el) => parseInt(el.textContent || '0'))
    )
    const rooms = await courseRow.$$eval('tr > td:nth-child(16) > .top-fline', (els) =>
      els.map((el) => el.textContent || 'Homeless')
    )
    const lecturers = await courseRow.$$eval('tr > td:nth-child(17) > .top-fline', (els) =>
      els.map((el) => el.textContent || 'Self-learning')
    )

    // Create lesson list
    const lessons: Lesson[] = []
    const combinedLessonIndexes: number[] = []

    for (let i = 0; i < daysOfWeek.length; i++) {
      if (combinedLessonIndexes.includes(i)) {
        continue
      }

      const lesson: Lesson = {
        day: daysOfWeek[i],
        room: rooms[i],
        begin: begins[i],
        periods: periods[i],
        lecturers: [
          !lecturers[i] || lecturers[i].replace(/\s/g, '') === '' ? 'Unknown' : lecturers[i],
        ],
      }

      if (await this.isLab(lesson)) {
        lesson.lecturers[0] += ' (Lab)'
      }

      for (let j = i + 1; j < daysOfWeek.length; j++) {
        if (combinedLessonIndexes.includes(j)) {
          continue
        }

        // Combine if 2 lesson begin at the same time and place
        if (daysOfWeek[i] === daysOfWeek[j] && rooms[i] === rooms[j] && begins[i] === begins[j]) {
          if (await this.isLab({ room: rooms[j] })) {
            lecturers[j] += ' (Lab)'
          }

          // Add new lecturers to lesson
          if (!lesson.lecturers.includes(lecturers[j])) {
            lesson.lecturers.push(lecturers[j])
          }

          // Take greater periods
          if (lesson.periods < periods[j]) {
            lesson.periods = periods[j]
          }

          combinedLessonIndexes.push(j)
        }
      }

      lessons.push(lesson)
    }

    return {
      code,
      id,
      name,
      credits,
      classId,
      capacity,
      lessons,
    } as Course
  }

  abstract isLab(lesson: Partial<Lesson>): Promise<boolean>
}
