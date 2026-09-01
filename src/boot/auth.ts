import { defineBoot } from '#q-app'
import { useUserStore } from '@/stores/user'

export default defineBoot(({ router, store, ssrContext }) => {
  const user = useUserStore(store)

  if (import.meta.env.QUASAR_SERVER && ssrContext) {
    const sessionUser = ssrContext.req.session.passport?.user

    if (sessionUser) {
      user._id = sessionUser._id
      user.name = sessionUser.name
      user.avatar = sessionUser.avatar
    } else {
      user.clearData()
    }
  }

  router.beforeEach((to) => {
    if (to.meta.login && !user.isLogin) {
      return '/'
    }
  })
})
