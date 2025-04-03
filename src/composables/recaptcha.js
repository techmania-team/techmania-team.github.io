import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReCaptcha, ReCaptchaInstance } from 'recaptcha-v3'
import { useUserStore } from 'src/stores/user'

export function useRecaptcha() {
  onMounted(async () => {
    if (process.env.CLIENT) {
      const route = useRoute()
      const { recaptchaLoaded } = useReCaptcha()
      const user = useUserStore()

      await recaptchaLoaded()
      if (route?.meta?.recaptcha && user.isLogin) {
        ReCaptchaInstance.showBadge()
      } else {
        ReCaptchaInstance.hideBadge()
      }
    }
  })
}
