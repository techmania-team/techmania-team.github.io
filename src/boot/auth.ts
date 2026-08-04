import { defineBoot } from '#q-app'
import { useUserStore } from '@/stores/user'

export default defineBoot(({ router }) => {
  router.beforeEach(async (to) => {
    const user = useUserStore()

    await user.fetchData()

    if (to.meta.login && !user.isLogin) {
      return '/'
    }
  })
})
