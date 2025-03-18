import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import api from 'src/utils/api'

export const useTempSkinStore = defineStore('temp-skin', () => {
  const _id = ref('')
  const name = ref('')
  const type = ref(0)
  const link = ref('')
  const previews = ref([{ link: '', name: '' }])
  const image = ref('')
  const description = ref('')
  const submitter = ref({ name: '', _id: '' })
  const rating = ref({
    rating: 0,
    count: 0,
  })

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
  }

  const fetchSkin = (id) => {
    return api.get(`/skins/${id}`).then(
      ({ data }) => {
        setSkin(data.result)
      },
      () => {},
    )
  }

  const clearData = () => {
    _id.value = ''
    name.value = ''
    type.value = 0
    link.value = ''
    previews.value = [{ link: '', name: '' }]
    description.value = ''
    submitter.value = { name: '', _id: '' }
    rating.value.rating = 0
    rating.value.count = 0
    image.value = ''
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
    setSkin,
    fetchSkin,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTempSkinStore, import.meta.hot))
}
