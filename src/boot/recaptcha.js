import { defineBoot } from '#q-app/wrappers'
import { VueReCaptcha, useReCaptcha } from 'vue-recaptcha-v3'

export default defineBoot(({ app, router }) => {
  app.use(VueReCaptcha, {
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    loaderOptions: { autoHideBadge: true },
  })

  router.afterEach(async (to) => {
    if (!process.env.CLIENT) return

    const recaptcha = useReCaptcha()

    // Wait for recaptcha to be loaded
    await recaptcha.recaptchaLoaded()

    // Show or hide the badge based on the route meta
    if (to.meta.recaptcha) {
      recaptcha.instance.value.showBadge()
    } else {
      recaptcha.instance.value.hideBadge()
    }
  })
})
