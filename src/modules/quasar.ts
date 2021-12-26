import { Quasar } from 'quasar'
import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(Quasar, {
    //
  })
}
