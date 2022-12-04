import { Univerisity } from '@/enums'
import { Page } from 'puppeteer'
import { UniversityRecord } from '../storage'

type Credentials = {
  username: string
  password: string
}

type SensitiveTime = {
  from: {
    hour: number
    minute: number
  }
  to: {
    hour: number
    minute: number
  }
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

  sensitiveTimes: SensitiveTime[]
}

export interface Scraper {
  page: Page
  details: ScraperDetails

  scrape(): Promise<UniversityRecord | null>
}
