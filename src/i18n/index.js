import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import { Lang } from 'quasar'

export let i18n = undefined

export const setupI18n = (ssrContext) => {
  i18n = createI18n({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    legacy: false,
  })
  setLocale('en-US', ssrContext)
  return i18n
}

export const localeOptions = ['en-US', 'zh-TW', 'zh-CN', 'ja-JP']

export const loadLocaleMessages = async (locale) => {
  const json = await import(`./locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, json.default)
  return nextTick()
}

export const setLocale = async (locale, ssrContext = undefined) => {
  if (!i18n) return

  // If locale not in the list, fallback to en-US
  let localeToSet = localeOptions.includes(locale) ? locale : 'en-US'

  // If locale not loaded, load it
  await loadLocaleMessages(localeToSet)

  // Set locale
  i18n.global.locale.value = localeToSet
  Lang.set({ isoName: localeToSet }, ssrContext)
}

/**
 * Get locale from Accept-Language header
 * @param {*} acceptLanguage
 * @returns Supported locale string
 */
export const getDefaultLocale = (ssrContext) => {
  // Note:
  // Lang.getLocale() returns undefined in SSR mode
  // so we need to get it from the request header
  const userLang = ssrContext
    ? ssrContext.req.headers['accept-language']?.split(',')?.map((x) => x.split(';')?.[0])?.[0] ||
      'en-US'
    : Lang.getLocale()

  // Check if userLang is in the list of supported locales
  return userLang.includes('en')
    ? 'en-US'
    : userLang.includes('ja')
      ? 'ja-JP'
      : userLang.includes('ko')
        ? 'ko-KR'
        : localeOptions.includes(userLang)
          ? userLang
          : 'en-US'
}

/**
 * Get i18n route
 * @param {*} to Route object
 * @returns Route object with lang param
 */
export const getI18nRoute = (to) => {
  return {
    ...to,
    params: { ...to.params, locale: i18n ? i18n.global.locale.value : 'en-US' },
  }
}
