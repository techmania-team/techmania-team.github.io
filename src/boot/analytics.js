import { defineRouter } from '#q-app/wrappers'
import ga from 'src/utils/analytics'

export default defineRouter(({ router }) => {
  router.afterEach((to) => {
    ga.logPage(to.path, to.name)
  })
})
