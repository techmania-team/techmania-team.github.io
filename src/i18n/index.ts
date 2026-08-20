import type { QSsrContext } from '#q-app'
import type { QuasarLanguage } from 'quasar'
import type { Composer } from 'vue-i18n'
import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import { Lang } from 'quasar'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

export const localeOptions = ['en-US', 'zh-TW', 'zh-CN', 'ja-JP', 'ko-KR']
export type SupportedLocale = (typeof localeOptions)[number]

type ExpectedLangType = Parameters<typeof Lang.set>[0]

// relative path to your node_modules/quasar/..
// change to YOUR path
const langList = import.meta.glob<{ default: QuasarLanguage }>(
  '../../node_modules/quasar/lang/{en-US,zh-TW,zh-CN,ja,ko-KR}.js',
)
// or just a select few (example below with only DE and FR):
// import.meta.glob('../../node_modules/quasar/lang/{de,fr}.js')

// Module-level i18n instance to avoid calling useI18n() outside of setup()
let _i18n: ReturnType<typeof createI18n> | null = null

// Helper to get the global Composer with correct typing (legacy: false mode)
const getGlobal = () => _i18n?.global as Composer | undefined

export const setupI18n = async (ssrContext: QSsrContext | null | undefined) => {
  _i18n = createI18n({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    legacy: false,
  })
  await setLocale('en-US', ssrContext)
  return _i18n
}

export const loadLocaleMessages = async (locale: SupportedLocale) => {
  const global = getGlobal()
  if (!global) return
  const json = await import(`./locales/${locale}.json`)
  global.setLocaleMessage(locale, json.default)
  return nextTick()
}

export const setLocale = async (locale: string, ssrContext: QSsrContext | null | undefined) => {
  const global = getGlobal()
  if (!global) return

  // If locale not in the list, fallback to en-US
  const localeToSet = localeOptions.includes(locale) ? locale : 'en-US'

  // If locale not loaded, load it
  await loadLocaleMessages(localeToSet)

  // Set locale
  global.locale.value = localeToSet
  const path = `../../node_modules/quasar/lang/${localeToSet === 'ja-JP' ? 'ja' : localeToSet}.js`
  const quasarLang = await langList[path]!()
  Lang.set(quasarLang.default as ExpectedLangType, ssrContext)
}

/**
 * Get locale from Accept-Language header
 * @param {*} ssrContext
 * @returns Supported locale string
 */
export const getDefaultLocale = (ssrContext: QSsrContext | null | undefined) => {
  // Note:
  // Lang.getLocale() returns undefined in SSR mode
  // so we need to get it from the request header
  const userLang = ssrContext
    ? ssrContext.req.headers['accept-language']?.split(',')?.map((x) => x.split(';')?.[0])?.[0] ||
      'en-US'
    : Lang.getLocale() || 'en-US'

  // Check specific zh variants before generic checks to avoid wrong fallback
  if (userLang.startsWith('zh-TW')) return 'zh-TW'
  if (userLang.startsWith('zh-CN') || userLang.startsWith('zh')) return 'zh-CN'
  if (userLang.includes('en')) return 'en-US'
  if (userLang.includes('ja')) return 'ja-JP'
  if (userLang.includes('ko')) return 'ko-KR'

  return localeOptions.includes(userLang) ? userLang : 'en-US'
}

/**
 * Get i18n route
 * @param {*} to Route object
 * @returns Route object with lang param
 */
export const getI18nRoute = (
  to: RouteLocationRaw | RouteLocationNormalizedLoaded,
): RouteLocationRaw => {
  const locale = getGlobal()?.locale.value || 'en-US'

  // String routes don't support params object, return as-is
  if (typeof to === 'string') return to

  const existingParams = 'params' in to && to.params ? to.params : {}

  return {
    ...to,
    params: {
      ...existingParams,
      locale,
    },
  } as unknown as RouteLocationRaw
}
