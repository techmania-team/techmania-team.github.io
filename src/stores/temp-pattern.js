import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import api from 'src/utils/api'

export const useTempPatternStore = defineStore('temp-pattern', () => {
  const _id = ref('')
  const name = ref('')
  const composer = ref('')
  const keysounded = ref('')
  const difficulties = ref([])
  const link = ref('')
  const previews = ref([])
  const image = ref('')
  const description = ref('')
  const submitter = ref({ name: '', _id: '' })

  const setPattern = (data) => {
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
  }

  const fetchPattern = async (id) => {
    try {
      const { data } = await api.get(`/patterns/${id}`)
      console.log(data)
      setPattern(data.result)
    } catch (error) {
      console.error(error)
    }
  }

  const clearData = () => {
    _id.value = ''
    name.value = ''
    composer.value = ''
    keysounded.value = ''
    difficulties.value = []
    link.value = ''
    previews.value = []
    image.value = ''
    description.value = ''
    submitter.value = { name: '', _id: '' }
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
    setPattern,
    fetchPattern,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTempPatternStore, import.meta.hot))
}
