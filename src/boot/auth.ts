import { defineBoot } from '#q-app'
import { localeOptions } from '@/i18n'
import { useUserStore } from '@/stores/user'

export default defineBoot(({ router, store, ssrContext, urlPath, redirect }) => {
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

    // The guard below only swaps what gets rendered, which would answer a
    // form page with the home page and a 200. Redirect for real instead.
    const to = router.resolve(urlPath)
    if (to.meta.login && !user.isLogin) {
      const { locale } = to.params as { locale?: string }
      redirect(locale && localeOptions.includes(locale) ? `/${locale}` : '/')
      return
    }
  }

  router.beforeEach((to) => {
    if (to.meta.login && !user.isLogin) {
      return '/'
    }
  })
})
