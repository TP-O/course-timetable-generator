import { Univerisity } from '@/enums'
import { Page } from 'puppeteer'
import { UniversityRecord } from '../storage'

type Credentials = {
  username: string
  password: string
}

export type ScraperDetails = {
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

export interface Scraper {
  page: Page
  details: ScraperDetails

  scrape(): Promise<UniversityRecord>
}
