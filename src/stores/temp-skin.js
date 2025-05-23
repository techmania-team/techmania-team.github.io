import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import api from 'src/utils/api'
import { SKIN_NOTE } from 'src/utils/skin'
import { handleError } from 'src/utils/handleError'

export const useTempSkinStore = defineStore('temp-skin', () => {
  const _id = ref('')
  const name = ref('')
  const type = ref(SKIN_NOTE)
  const link = ref('')
  const previews = ref([])
  const image = ref('')
  const description = ref('')
  const createdAt = ref('')
  const updatedAt = ref('')
  const submitter = ref({ name: '', _id: '' })
  const rating = ref({ count: 0, avg: 0 })

  const setSkin = (data) => {
    _id.value = data._id
    name.value = data.name
    type.value = data.type
    link.value = data.link
    previews.value = data.previews
    description.value = data.description
    submitter.value = data.submitter
    rating.value = data.rating
    image.value = data.image
    createdAt.value = data.createdAt
    updatedAt.value = data.updatedAt
  }

  const fetchSkin = async (id) => {
    try {
      const { data } = await api.get(`/skins/${id}`)
      setSkin(data.result)
    } catch (error) {
      handleError(error)
    }
  }

  const clearData = () => {
    _id.value = ''
    name.value = ''
    type.value = SKIN_NOTE
    link.value = ''
    previews.value = []
    description.value = ''
    submitter.value = { name: '', _id: '' }
    rating.value = { count: 0, avg: 0 }
    image.value = ''
    createdAt.value = ''
    updatedAt.value = ''
  }

  return {
    _id,
    name,
    type,
    link,
    previews,
    description,
    submitter,
    rating,
    image,
    createdAt,
    updatedAt,
    setSkin,
    fetchSkin,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTempSkinStore, import.meta.hot))
}
