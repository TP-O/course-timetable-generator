import { Univerisity } from '@/enums'
import { Lesson } from '@/types'
import { env } from 'process'
import { Page } from 'puppeteer'
import { EdusoftScraper } from './edusoft'

export class HCMIUScraper extends EdusoftScraper {
  constructor(readonly page: Page) {
    super(page, {
      university: Univerisity.HCMIU,
      host: 'https://edusoftweb.hcmiu.edu.vn',
      signInPath: '/',
      coursePath: '/Default.aspx?page=dkmonhoc',
      credentials: {
        username: String(env.HCMIU_ID),
        password: String(env.HCMIU_PASSWORD),
      },
    })
  }

  async isLab(lesson: Partial<Lesson>): Promise<boolean> {
    return lesson.room?.includes('LA') || false
  }
}
