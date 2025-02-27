import { defineBoot } from '#q-app/wrappers'
import { VueReCaptcha } from 'vue-recaptcha-v3'

export default defineBoot(({ app }) => {
  app.use(VueReCaptcha, { siteKey: process.env.RECAPTCHA_SITE_KEY, loaderOptions: { autoHideBadge: true } })
})
