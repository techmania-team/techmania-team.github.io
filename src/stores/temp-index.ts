import type { IRelease } from '@/types/info'
import type { IPattern } from '@/types/pattern'
import type { ISetlist } from '@/types/setlist'
import type { ISkin } from '@/types/skin'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { getReleases } from '@/services/info'
import { search as searchPatterns } from '@/services/pattern'
import { search as searchSetlists } from '@/services/setlist'
import { search as searchSkins } from '@/services/skin'
import { handleError } from '@/utils/handleError'

export const useTempIndexStore = defineStore('temp-index', () => {
  const releases = ref<IRelease>({
    win: {
      tag: '',
      date: '',
    },
    ios: {
      tag: '',
      date: '',
    },
    android: {
      tag: '',
      date: '',
    },
    mac: {
      tag: '',
      date: '',
    },
  })

  const patterns = ref<IPattern[]>([])
  const skins = ref<ISkin[]>([])
  const setlists = ref<ISetlist[]>([])

  const fetchData = async () => {
    try {
      const [pt, skin, setlist, re] = await Promise.all([
        searchPatterns({ start: 0, limit: 8 }),
        searchSkins({ start: 0, limit: 8 }),
        searchSetlists({ start: 0, limit: 8 }),
        getReleases(),
      ])
      patterns.value = pt.data.result || []
      skins.value = skin.data.result || []
      setlists.value = setlist.data.result || []
      releases.value = re.data.result
    } catch (error) {
      handleError(error)
    }
  }

  const clearData = () => {
    releases.value = {
      win: {
        tag: '',
        date: '',
      },
      ios: {
        tag: '',
        date: '',
      },
      android: {
        tag: '',
        date: '',
      },
      mac: {
        tag: '',
        date: '',
      },
    }
    patterns.value = []
    skins.value = []
  }

  return {
    releases,
    patterns,
    skins,
    setlists,
    fetchData,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTempIndexStore, import.meta.hot))
}
