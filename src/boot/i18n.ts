import { defineBoot } from '#q-app'
import { getDefaultLocale, getI18nRoute, setLocale, setupI18n } from '@/i18n'

export default defineBoot(async ({ app, router, ssrContext }) => {
  const i18n = await setupI18n(ssrContext)
  app.use(i18n)

  router.beforeEach(async (to) => {
    if (to.name === 'error-404') {
      return
    }

    const localeParam = Array.isArray(to.params.locale) ? to.params.locale[0] : to.params.locale

    if (!localeParam) {
      const locale = getDefaultLocale(ssrContext)
      await setLocale(locale, ssrContext)
      return getI18nRoute(to)
    } else {
      await setLocale(localeParam, ssrContext)
    }
  })
})
