import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReCaptcha, ReCaptchaInstance } from 'recaptcha-v3'
import { useStore } from 'vuex'

export function useRecaptcha() {
  onMounted(async () => {
    if (process.env.CLIENT) {
      const route = useRoute()
      const { recaptchaLoaded } = useReCaptcha()
      const store = useStore()
      const user = store.user.getters.getUserData

      await recaptchaLoaded()
      if (route?.meta?.recaptcha && user.isLogin) {
        ReCaptchaInstance.showBadge()
      } else {
        ReCaptchaInstance.hideBadge()
      }
    }
  })
}
