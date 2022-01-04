import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
import { Quasar } from 'quasar'
import type { UserModule } from '~/types'

export const install: UserModule = ({ app }) => {
  app.use(Quasar, {
    //
  })
}
