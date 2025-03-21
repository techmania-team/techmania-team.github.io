import { defineBoot } from '#q-app/wrappers'
import { Lang } from 'quasar'
import { i18n, localeOptions, setLocale } from 'src/i18n'
import { useSettingsStore } from 'src/stores/settings'

export default defineBoot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)

  if (process.env.CLIENT) {
    const settings = useSettingsStore()

    if (settings.locale) {
      if (!localeOptions.includes(settings.locale)) {
        settings.locale = Lang.getLocale()
      }
      setLocale(settings.locale)
    } else {
      const localeDetected = Lang.getLocale()
      settings.locale = localeDetected
      setLocale(localeDetected)
    }
  }
})
