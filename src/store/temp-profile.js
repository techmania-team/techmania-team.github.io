import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'src/utils/api'
import handleError from 'src/utils/handleError'

export const useTempProfileStore = defineStore('temp-profile', () => {
  const name = ref('')
  const avatar = ref('')
  const patternCount = ref(0)
  const skinCount = ref(0)
  const replyCount = ref(0)
  const _id = ref('')

  const fetchData = async (id) => {
    try {
      const { result } = await api.get(`/users/${id}`)
      name.value = result.name
      avatar.value = result.avatar
      patternCount.value = result.patternCount || 0
      skinCount.value = result.skinCount || 0
      replyCount.value = result.replyCount || 0
      _id.value = result._id
    } catch (error) {
      handleError(error)
    }
  }

  const clearData = () => {
    name.value = ''
    avatar.value = ''
    patternCount.value = 0
    skinCount.value = 0
    replyCount.value = 0
    _id.value = ''
  }

  return {
    name,
    avatar,
    patternCount,
    skinCount,
    replyCount,
    _id,
    fetchData,
    clearData,
  }
})
