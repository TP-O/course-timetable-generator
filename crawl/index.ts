import { Browser, Builder } from 'selenium-webdriver'
import { config } from 'dotenv'
import { writeFileSync } from 'fs'
import date from 'date-and-time'
import { HCMIUCrawler } from './edusoft/hcmiu'
import { Crawler } from '@/types/crawl'
import { UniversityRecord } from '@/types/storage'

config({
  path: '.env.crawl.local',
})

// Run
;(async () => {
  const retry = 2
  const dataDir = './data'
  const driver = await new Builder().forBrowser(Browser.FIREFOX).build()
  const crawlers: Crawler[] = [new HCMIUCrawler(driver)]

  for (const crawler of crawlers) {
    let universityRecord: UniversityRecord | undefined = undefined

    console.log(`Crawling data [${crawler.details.university}]`)

    for (let i = 0; i < retry; i++) {
      try {
        universityRecord = await crawler.crawl()

        console.log('Successful!')

        break
      } catch (err) {
        console.error(`Failed! Retry times remaining: ${retry - i}`)
        console.error(err)
      }

      driver.manage().deleteAllCookies()
    }

    if (universityRecord && Object.keys(universityRecord).length > 0) {
      universityRecord.updatedAt = {
        seconds: Date.now(),
        text: date.format(new Date(), 'ddd, MMM/DD/YYYY HH:mm:ss'),
      }

      writeFileSync(
        `${dataDir}/${crawler.details.university}.json`,
        JSON.stringify(universityRecord)
      )
    }
  }

  await driver.quit()
})()
