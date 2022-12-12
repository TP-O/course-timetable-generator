import _isEqual from 'lodash/isEqual'
import { config } from 'dotenv'
import { writeFileSync } from 'fs'
import date from 'date-and-time'
import { HCMIUScraper } from './edusoft/hcmiu'
import { Scraper } from '@/types/scrape'
import { UniversityRecord } from '@/types/storage'
import puppeteer from 'puppeteer'
import { env } from 'process'
import { getUniversity } from '@/services'

config({
  path: '.env.scrape.local',
})

// Run
;(async () => {
  const retry = 2
  const dataDir = './data'
  const browser = await puppeteer.launch({ headless: env.NODE_ENV !== 'development' })
  const page = await browser.newPage()
  const scrapers: Scraper[] = [new HCMIUScraper(page)]

  for (const scraper of scrapers) {
    console.log(`Scraping data [${scraper.details.university}]`)

    let isSensitive = false
    const now = new Date()

    for (const time of scraper.details.sensitiveTimes) {
      if (
        (now.getUTCHours() > time.from.hour ||
          (now.getUTCHours() == time.from.hour && now.getUTCMinutes() >= time.from.minute)) &&
        (now.getUTCHours() < time.to.hour ||
          (now.getUTCHours() == time.to.minute && now.getUTCMinutes() <= time.to.minute))
      ) {
        isSensitive = true
        break
      }
    }

    if (isSensitive) {
      console.log(`Skip scraping data [${scraper.details.university}]`)
      continue
    }

    let universityRecord: UniversityRecord | null = null

    for (let i = 1; i <= retry; i++) {
      try {
        universityRecord = await scraper.scrape()

        break
      } catch (err) {
        console.error(err)
        console.error(`Failed! Retry times remaining: ${retry - i}`)
      }

      // Clear cookies
      const pages = await browser.pages()

      for (const page of pages) {
        const client = await page.target().createCDPSession()
        await client.send('Network.clearBrowserCookies')
      }
    }

    if (universityRecord) {
      const university = await getUniversity(scraper.details.university)

      if (_isEqual(university?.courses || {}, universityRecord.courses)) {
        console.log('Nothing changes!')
        continue
      }

      console.log('Done!')

      universityRecord.updatedAt = {
        seconds: Date.now(),
        text: date.format(new Date(), 'ddd, MMM/DD/YYYY HH:mm:ss'),
      }

      writeFileSync(
        `${dataDir}/${scraper.details.university}.json`,
        JSON.stringify(universityRecord)
      )
    } else {
      console.log('Invalid data!')
    }
  }

  await browser.close()
})()
