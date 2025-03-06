import { defineBoot } from '#q-app/wrappers'
import { useUserStore } from 'src/stores/user'

export default defineBoot(({ router }) => {
  router.beforeEach(async (to, from, next) => {
    const user = useUserStore()
    await user.fetchData()
    if (to.meta.login && !user.isLogin) {
      next('/')
    } else {
      next()
    }
  })
})
