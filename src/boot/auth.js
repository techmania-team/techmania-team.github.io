import { defineBoot } from '#q-app/wrappers'
import { useUserStore } from 'src/stores/user'
import { Cookies } from 'quasar'

export default defineBoot(({ router, ssrContext }) => {
  router.beforeEach(async (to, from, next) => {
    const user = useUserStore()

    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies
    const sid = cookies.get('connect.sid')

    if (sid) {
      await user.fetchData(sid)
    }

    if (to.meta.login && !user.isLogin) {
      return next('/')
    }

    next()
  })
})
