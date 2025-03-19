import { defineBoot } from '#q-app/wrappers'
import { Lang } from 'quasar'
import { createI18n } from 'vue-i18n'
import messages, { localeOptions } from 'src/i18n'
import { useSettingsStore } from 'src/stores/settings'

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages,
    silentFallbackWarn: true,
  })

  // Set i18n instance on app
  app.use(i18n)

  if (process.env.CLIENT) {
    const settings = useSettingsStore()

    if (settings.locale) {
      if (!localeOptions.includes(settings.locale)) {
        settings.locale = Lang.getLocale()
      }
      i18n.global.locale.value = settings.locale
    } else {
      const localeDetected = Lang.getLocale()
      settings.locale = localeDetected
      i18n.global.locale.value = localeDetected
    }
  }
})
