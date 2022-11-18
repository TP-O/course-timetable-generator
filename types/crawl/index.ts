import { Univerisity } from '@/enums'
import { WebDriver } from 'selenium-webdriver'
import { UniversityRecord } from '../storage'

type Credentials = {
  username: string
  password: string
}

export type CrawlerDetails = {
  university: Univerisity

  /**
   * University website's domain name.
   */
  host: string

  /**
   * Path to sign-in page.
   */
  signInPath: string

  /**
   * Path to course table page.
   */
  coursePath: string

  /**
   * University credentials.
   */
  credentials: Credentials
}

export interface Crawler {
  driver: WebDriver
  details: CrawlerDetails

  crawl(): Promise<UniversityRecord>
}
