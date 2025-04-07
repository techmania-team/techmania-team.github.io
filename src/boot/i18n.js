import { defineBoot } from '#q-app/wrappers'
import { setupI18n, getDefaultLocale, setLocale, getI18nRoute } from 'src/i18n'

export default defineBoot(async ({ app, router, ssrContext }) => {
  const i18n = setupI18n(ssrContext)
  app.use(i18n)

  router.beforeEach(async (to, from, next) => {
    if (!to.params.locale) {
      const locale = getDefaultLocale(ssrContext)
      await setLocale(locale, ssrContext)
      return next(getI18nRoute(to))
    } else {
      await setLocale(to.params.locale, ssrContext)
    }
    next()
  })
})
