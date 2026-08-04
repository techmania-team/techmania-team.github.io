import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getAuthInfo } from '@/services/auth'

export const useUserStore = defineStore('user', () => {
  const _id = ref('')
  const name = ref('')
  const avatar = ref('')

  const isLogin = computed(() => _id.value.length > 0)

  const fetchData = async () => {
    try {
      const { data } = await getAuthInfo()
      _id.value = data.result._id
      name.value = data.result.name
      avatar.value = data.result.avatar
    } catch {
      clearData()
    }
  }

  const clearData = () => {
    _id.value = ''
    name.value = ''
    avatar.value = ''
  }

  return {
    _id,
    name,
    avatar,
    isLogin,
    fetchData,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
