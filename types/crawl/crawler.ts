import { Univerisity } from '@/enums'
import { WebDriver } from 'selenium-webdriver'
import { UniversityRecord } from './storage'

export interface Crawler {
  driver: WebDriver
  details: CrawlerDetails

  crawl(): Promise<UniversityRecord>
}

export type CrawlerDetails = {
  university: Univerisity
  host: string
  signInPath: string
  coursePath: string
  account: Account
}

type Account = {
  id: string
  password: string
}
