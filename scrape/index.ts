import { config } from 'dotenv'
import { writeFileSync } from 'fs'
import date from 'date-and-time'
import { HCMIUScraper } from './edusoft/hcmiu'
import { Scraper } from '@/types/scrape'
import { UniversityRecord } from '@/types/storage'
import puppeteer from 'puppeteer'
import { env } from 'process'

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
    let universityRecord: UniversityRecord | undefined = undefined

    console.log(`Scraping data [${scraper.details.university}]`)

    for (let i = 1; i <= retry; i++) {
      try {
        universityRecord = await scraper.scrape()

        console.log('Done!\n\n')

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

    if (universityRecord && Object.keys(universityRecord).length > 0) {
      universityRecord.updatedAt = {
        seconds: Date.now(),
        text: date.format(new Date(), 'ddd, MMM/DD/YYYY HH:mm:ss'),
      }

      writeFileSync(
        `${dataDir}/${scraper.details.university}.json`,
        JSON.stringify(universityRecord)
      )
    }
  }

  await browser.close()
})()
