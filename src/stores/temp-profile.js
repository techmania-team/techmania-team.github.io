import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import api from 'src/utils/api'
import handleError from 'src/utils/handleError'

export const useTempProfileStore = defineStore('temp-profile', () => {
  const name = ref('')
  const avatar = ref('')
  const patternCount = ref(0)
  const skinCount = ref(0)
  const setlistCount = ref(0)
  const commentCount = ref(0)
  const _id = ref('')

  const fetchProfile = async (id) => {
    try {
      const { data } = await api.get(`/users/${id}`)
      name.value = data.result.name || ''
      avatar.value = data.result.avatar || ''
      patternCount.value = data.result.patternCount || 0
      skinCount.value = data.result.skinCount || 0
      setlistCount.value = data.result.setlistCount || 0
      commentCount.value = data.result.commentCount || 0
      _id.value = data.result._id || ''
    } catch (error) {
      handleError(error)
    }
  }

  const clearData = () => {
    name.value = ''
    avatar.value = ''
    patternCount.value = 0
    skinCount.value = 0
    setlistCount.value = 0
    commentCount.value = 0
    _id.value = ''
  }

  return {
    name,
    avatar,
    patternCount,
    skinCount,
    setlistCount,
    commentCount,
    _id,
    fetchProfile,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTempProfileStore, import.meta.hot))
}
