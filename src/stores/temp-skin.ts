import type { ISkin, ISkinPreview } from '@/types/skin'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import { handleError } from '@/utils/handleError'
import { SKINTYPE } from '@/utils/skin'

export const useTempSkinStore = defineStore('temp-skin', () => {
  const _id = ref('')
  const name = ref('')
  const type = ref(SKINTYPE.NOTE)
  const link = ref('')
  const previews = ref<ISkinPreview[]>([])
  const image = ref('')
  const description = ref('')
  const createdAt = ref('')
  const updatedAt = ref('')
  const submitter = ref({ name: '', _id: '' })
  const rating = ref({ count: 0, avg: 0 })

  const setSkin = (data: ISkin) => {
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

  const fetchSkin = async (id: string) => {
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
    type.value = SKINTYPE.NOTE
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
