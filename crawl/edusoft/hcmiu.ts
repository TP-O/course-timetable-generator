import { Univerisity } from '@/enums'
import { Lesson } from '@/types'
import { env } from 'process'
import { WebDriver } from 'selenium-webdriver'
import { EdusoftCrawler } from './edusoft'

export class HCMIUCrawler extends EdusoftCrawler {
  constructor(readonly driver: WebDriver) {
    super(driver, {
      university: Univerisity.HCMIU,
      host: 'https://edusoftweb.hcmiu.edu.vn',
      signInPath: '/',
      coursePath: '/Default.aspx?page=dkmonhoc',
      account: {
        id: String(env.HCMIU_ID),
        password: String(env.HCMIU_PASSWORD),
      },
    })
  }

  async isLab(lesson: Partial<Lesson>): Promise<boolean> {
    return lesson.room?.includes('LA') || false
  }
}
