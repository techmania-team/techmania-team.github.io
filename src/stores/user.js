import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useUserStore = defineStore('user', () => {
  const _id = ref('')
  const name = ref('')
  const avatar = ref('')

  const isLogin = computed(() => _id.value.length > 0)

  const fetchData = async (sid) => {
    try {
      const { data } = await api.get('/auth/user', {
        headers: {
          Cookie: `connect.sid=${sid}`,
        },
      })
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
