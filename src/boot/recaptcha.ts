import { useReCaptcha, VueReCaptcha } from 'vue-recaptcha-v3'
import { defineBoot } from '#q-app'
import { useUserStore } from '@/stores/user'

export default defineBoot(({ app, router }) => {
  app.use(VueReCaptcha, {
    siteKey: import.meta.env.QCLI_RECAPTCHA_SITE_KEY,
    loaderOptions: { autoHideBadge: true },
  })

  router.afterEach(async (to) => {
    if (!import.meta.env.QUASAR_CLIENT) return

    const recaptcha = useReCaptcha()
    const user = useUserStore()

    // Wait for recaptcha to be loaded
    await recaptcha?.recaptchaLoaded()

    // Show or hide the badge based on the route meta
    // Recaptcha only applies to submission pages and comment sections, which require login
    if (to.meta.recaptcha && user.isLogin) {
      recaptcha?.instance.value?.showBadge()
    } else {
      recaptcha?.instance.value?.hideBadge()
    }
  })
})
