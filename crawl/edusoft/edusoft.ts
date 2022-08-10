import { By, until, WebDriver, WebElement } from 'selenium-webdriver'
import some from 'lodash/some'
import { Course, Crawler, CrawlerDetails, Lesson, UniversityRecord } from '@/types'
import { convertDayStringToDayNumber } from '@/utils'

export abstract class EdusoftCrawler implements Crawler {
  constructor(readonly driver: WebDriver, readonly details: CrawlerDetails) {}

  async signIn() {
    await this.driver.get(this.details.host + this.details.signInPath)
    await this.driver
      .findElement(By.id('ctl00_ContentPlaceHolder1_ctl00_ucDangNhap_txtTaiKhoa'))
      .sendKeys(this.details.account.id)
    await this.driver
      .findElement(By.id('ctl00_ContentPlaceHolder1_ctl00_ucDangNhap_txtMatKhau'))
      .sendKeys(this.details.account.password)
    await this.driver
      .findElement(By.id('ctl00_ContentPlaceHolder1_ctl00_ucDangNhap_btnDangNhap'))
      .click()
  }

  async prepareToCrawl() {
    await this.driver.get(this.details.host + this.details.coursePath)

    try {
      // Remove notification hampering interaction if exists
      await this.driver.executeScript(
        'document.getElementById("ctl00_ContentPlaceHolder1_ctl00_pnlThongbao").remove()'
      )
    } catch {
      // Prevent error throwing
    }

    await this.driver.wait(until.elementLocated(By.id('selectKhoa')))
  }

  async filterCourse(courseRow: WebElement) {
    const code = await courseRow
      .findElement(By.css('tr > td:nth-child(1) > input'))
      .getAttribute('value')
    const id = await courseRow.findElement(By.css('tr > td:nth-child(2)')).getText()
    const name = (await courseRow.findElement(By.css('tr > td:nth-child(4)')).getText()).slice(1)
    const credits = parseInt(await courseRow.findElement(By.css('tr > td:nth-child(7)')).getText())
    const classId = await courseRow.findElement(By.css('tr > td:nth-child(9)')).getText()
    const capacity = parseInt(
      await courseRow.findElement(By.css('tr > td:nth-child(10)')).getText()
    )

    // These data belong to lesson object and they have the same array length.
    // Each index corresponding to data of one lesson, but these data can be combined
    // into one lesson in some special cases.
    const daysOfWeek = (await courseRow.findElement(By.css('tr > td:nth-child(13)')).getText())
      .split('\n ')
      .map((d) => convertDayStringToDayNumber(d))
    const begins = (await courseRow.findElement(By.css('tr > td:nth-child(14)')).getText())
      .split('\n ')
      .map((s) => parseInt(s))
    const periods = (await courseRow.findElement(By.css('tr > td:nth-child(15)')).getText())
      .split('\n ')
      .map((e) => parseInt(e))
    const rooms = (await courseRow.findElement(By.css('tr > td:nth-child(16)')).getText()).split(
      '\n '
    )
    const lecturers = (
      await courseRow.findElement(By.css('tr > td:nth-child(17)')).getText()
    ).split('\n ')

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
          lecturers[i] === undefined ||
          lecturers[i] === null ||
          lecturers[i].replace(/\s/g, '') === ''
            ? 'Unknown'
            : lecturers[i],
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

  async crawl() {
    await this.signIn()
    await this.prepareToCrawl()

    const universityRecord: UniversityRecord = {
      faculties: {},
      courses: {},
      updatedAt: undefined,
    }
    const faculties = await this.driver.findElements(
      By.css('#selectKhoa option:not(:first-child):not(:nth-last-child(2)):not(:last-child)')
    )

    for (const faculty of faculties) {
      await faculty.click()
      // Wait for data loading
      await this.driver.wait<boolean>(async (webdriver: WebDriver) => {
        return (await webdriver.executeScript('return document.body.style.cursor')) === 'default'
      })

      const facultyName = await faculty.getText()
      const coursesTable = await this.driver.findElements(By.css('#divTDK > table'))

      universityRecord.faculties[facultyName] = {
        courses: {},
        lecturers: [],
      }

      for (const courseRow of coursesTable) {
        const capacity = parseInt(
          await courseRow.findElement(By.css('tr > td:nth-child(10)')).getText()
        )

        // Skip if class is unavailable
        if (capacity <= 0) {
          continue
        }

        const courseItem = await this.filterCourse(courseRow)

        // Declare course of faculty if does not exist
        if (universityRecord.faculties[facultyName].courses[courseItem.name] === undefined) {
          universityRecord.faculties[facultyName].courses[courseItem.name] = {
            lecturers: [],
          }
        }

        // Declare course of record if does not exist
        if (universityRecord.courses[courseItem.name] === undefined) {
          universityRecord.courses[courseItem.name] = []
        }

        // Add new course to record
        if (
          !some(
            universityRecord.courses[courseItem.name],
            (e) => JSON.stringify(e) === JSON.stringify(courseItem)
          )
        ) {
          universityRecord.courses[courseItem.name].push(courseItem)
        }

        // Add new lecturers to faculty's lecturer and course's lecturer list
        courseItem.lessons.forEach((lesson) => {
          lesson.lecturers.forEach((lecturer) => {
            if (!universityRecord.faculties[facultyName].lecturers.includes(lecturer)) {
              universityRecord.faculties[facultyName].lecturers.push(lecturer)
            }

            if (
              !universityRecord.faculties[facultyName].courses[courseItem.name].lecturers.includes(
                lecturer
              )
            ) {
              universityRecord.faculties[facultyName].courses[courseItem.name].lecturers.push(
                lecturer
              )
            }
          })
        })
      }
    }

    return universityRecord
  }

  abstract isLab(lesson: Partial<Lesson>): Promise<boolean>
}
