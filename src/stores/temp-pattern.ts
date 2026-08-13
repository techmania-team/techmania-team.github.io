import type { IPattern, IPatternDifficulty, IPatternPreview } from '@/types/pattern'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import { handleError } from '@/utils/handleError'

export const useTempPatternStore = defineStore('temp-pattern', () => {
  const _id = ref('')
  const name = ref('')
  const composer = ref('')
  const keysounded = ref(false)
  const difficulties = ref<IPatternDifficulty[]>([])
  const link = ref('')
  const previews = ref<IPatternPreview[]>([])
  const image = ref('')
  const description = ref('')
  const createdAt = ref('')
  const updatedAt = ref('')
  const submitter = ref({ name: '', _id: '' })
  const rating = ref({ count: 0, avg: 0 })

  const setPattern = (data: IPattern) => {
    _id.value = data._id
    name.value = data.name
    composer.value = data.composer
    keysounded.value = data.keysounded
    difficulties.value = data.difficulties
    link.value = data.link
    previews.value = data.previews
    description.value = data.description
    submitter.value.name = data.submitter.name
    submitter.value._id = data.submitter._id
    image.value = data.image
    createdAt.value = data.createdAt
    updatedAt.value = data.updatedAt
    rating.value.count = data.rating.count
    rating.value.avg = data.rating.avg
  }

  const fetchPattern = async (id: string) => {
    try {
      const { data } = await api.get(`/patterns/${id}`)
      setPattern(data.result)
    } catch (error) {
      handleError(error)
    }
  }

  const clearData = () => {
    _id.value = ''
    name.value = ''
    composer.value = ''
    keysounded.value = false
    difficulties.value = []
    link.value = ''
    previews.value = []
    image.value = ''
    description.value = ''
    createdAt.value = ''
    updatedAt.value = ''
    submitter.value = { name: '', _id: '' }
    rating.value = { count: 0, avg: 0 }
  }

  return {
    _id,
    name,
    composer,
    keysounded,
    difficulties,
    link,
    previews,
    image,
    description,
    submitter,
    rating,
    createdAt,
    updatedAt,
    setPattern,
    fetchPattern,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTempPatternStore, import.meta.hot))
}
