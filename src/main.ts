// register vue composition api globally
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'

// windicss layers
import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
// quasar css
import 'quasar/src/css/index.sass'
// quasar icon library
import '@quasar/extras/material-icons/material-icons.css'
// your custom styles here
import './styles/main.css'
// windicss utilities should be the last style import
import 'virtual:windi-utilities.css'
// windicss devtools support (dev only)
import 'virtual:windi-devtools'

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes: [{
      path: '/:catchAll(.*)',
      component: () => import('~/pages/index.vue'),
    }],
  },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.globEager('./modules/*.ts')).map(i => i.install?.(ctx))
  },
)
