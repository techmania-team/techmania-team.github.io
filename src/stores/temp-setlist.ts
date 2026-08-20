import type {
  ISetlist,
  ISetlistHiddenPattern,
  ISetlistPreview,
  ISetlistSelectablePattern,
} from '@/types/setlist'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import { CONTROLTYPE } from '@/utils/control'
import { handleError } from '@/utils/handleError'

export const useTempSetlistStore = defineStore('temp-setlist', () => {
  const _id = ref('')
  const name = ref('')
  const link = ref('')
  const previews = ref<ISetlistPreview[]>([])
  const image = ref('')
  const description = ref('')
  const control = ref(CONTROLTYPE.TOUCH)
  const selectablePatterns = ref<ISetlistSelectablePattern[]>([])
  const hiddenPatterns = ref<ISetlistHiddenPattern[]>([])
  const submitter = ref({ name: '', _id: '' })
  const rating = ref({ count: 0, avg: 0 })
  const createdAt = ref('')
  const updatedAt = ref('')

  const setSetlist = (data: ISetlist) => {
    _id.value = data._id
    name.value = data.name
    link.value = data.link
    previews.value = data.previews
    description.value = data.description
    submitter.value = data.submitter
    rating.value = data.rating
    image.value = data.image
    control.value = data.control
    selectablePatterns.value = data.selectablePatterns
    hiddenPatterns.value = data.hiddenPatterns
    createdAt.value = data.createdAt
    updatedAt.value = data.updatedAt
  }

  const fetchSetlist = async (id: string) => {
    try {
      const { data } = await api.get(`/setlists/${id}`)
      setSetlist(data.result)
    } catch (error) {
      handleError(error)
    }
  }

  const clearData = () => {
    _id.value = ''
    name.value = ''
    link.value = ''
    previews.value = []
    description.value = ''
    submitter.value = { name: '', _id: '' }
    rating.value = { count: 0, avg: 0 }
    image.value = ''
    control.value = CONTROLTYPE.TOUCH
    selectablePatterns.value = []
    hiddenPatterns.value = []
    createdAt.value = ''
    updatedAt.value = ''
  }

  return {
    _id,
    name,
    link,
    previews,
    description,
    control,
    selectablePatterns,
    hiddenPatterns,
    submitter,
    rating,
    image,
    createdAt,
    updatedAt,
    setSetlist,
    fetchSetlist,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTempSetlistStore, import.meta.hot))
}
