import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { defineBoot } from '#q-app'
import { getDefaultLocale, getI18nRoute, localeOptions, setLocale, setupI18n } from '@/i18n'

const getLocaleParam = (route: RouteLocationNormalizedLoaded) => {
  // Every route but the 404 one has it, possibly empty
  const { locale } = route.params as { locale?: string | string[] }
  return (Array.isArray(locale) ? locale[0] : locale) ?? ''
}

/** A supported locale typed in the wrong case, e.g. /en-us/ */
const fixLocaleCase = (param: string) =>
  localeOptions.find((locale) => locale.toLowerCase() === param.toLowerCase())

export default defineBoot(async ({ app, router, ssrContext, urlPath, redirect }) => {
  const i18n = await setupI18n(ssrContext)
  app.use(i18n)

  // On the server, the guard below only changes what gets rendered: the
  // response would still be a 200 for the URL that was asked for, so the same
  // page answered at /patterns, /fr-FR/patterns and /en-US/patterns alike.
  // Redirect for real instead, so every page has exactly one URL per locale.
  if (ssrContext) {
    const to = router.resolve(urlPath)
    const param = getLocaleParam(to)

    if (to.name !== 'error-404' && !localeOptions.includes(param)) {
      const fixedCase = fixLocaleCase(param)
      // Which locale an unprefixed URL lands on depends on this header
      if (!fixedCase) ssrContext.res.setHeader('Vary', 'Accept-Language')

      const location = router.resolve({
        name: to.name,
        params: { ...to.params, locale: fixedCase ?? getDefaultLocale(ssrContext) },
        query: to.query,
        hash: to.hash,
      } as Parameters<typeof router.resolve>[0])
      redirect(location.fullPath, fixedCase ? 301 : 302)
      return
    }
  }

  router.beforeEach(async (to) => {
    // The catch-all route has no locale param, so read it off the path, e.g. /zh-TW/nope
    if (to.name === 'error-404') {
      const segment = to.path.split('/')[1] ?? ''
      await setLocale(
        localeOptions.includes(segment) ? segment : getDefaultLocale(ssrContext),
        ssrContext,
      )
      return
    }

    const localeParam = getLocaleParam(to)
    const isValidLocale = localeOptions.includes(localeParam)
    const locale = isValidLocale ? localeParam : getDefaultLocale(ssrContext)

    await setLocale(locale, ssrContext)
    if (!isValidLocale) return getI18nRoute(to)
  })
})
