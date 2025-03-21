import { createI18n } from 'vue-i18n'
import { useSettingsStore } from 'src/stores/settings'
import enUS from './locales/en-US.json'

export const i18n = createI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: { 'en-US': enUS },
  silentFallbackWarn: true,
})

export const localeOptions = ['en-US', 'zh-TW', 'zh-CN', 'ja-JP', 'ko-KR']

export const loadLocaleMessages = async (locale) => {
  const json = await import(`./locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, json.default)
}

export const setLocale = async (locale) => {
  // Same locale, do nothing
  if (i18n.global.locale.value === locale) return

  // If locale not in the list, fallback to en-US
  let localeToSet = localeOptions.includes(locale) ? locale : 'en-US'

  // If locale not loaded, load it
  if (!i18n.global.availableLocales.includes(localeToSet)) {
    await loadLocaleMessages(localeToSet)
  }

  // Set locale
  const settings = useSettingsStore()
  settings.locale = localeToSet
  i18n.global.locale.value = localeToSet
  document.querySelector('html').setAttribute('lang', localeToSet)
}
