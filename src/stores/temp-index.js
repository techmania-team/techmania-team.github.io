import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import api from 'src/utils/api'
import handleError from 'src/utils/handleError'

export const useTempIndexStore = defineStore('temp-index', () => {
  const tag = ref({
    win: '-',
    ios: '-',
    android: '-',
    mac: '-',
  })
  const publishDate = ref({
    win: '',
    ios: '',
    android: '',
    mac: '',
  })

  const patterns = ref([])
  const skins = ref([])
  const setlists = ref([])

  const fetchData = async () => {
    try {
      const [pt, skin, setlist] = await Promise.all([
        api.get('/patterns?start=0&limit=8'),
        api.get('/skins?start=0&limit=8'),
        api.get('/setlists?start=0&limit=8'),
      ])
      patterns.value = pt.data.result
      skins.value = skin.data.result
      setlists.value = setlist.data.result
    } catch (error) {
      handleError(error)
    }
  }

  const fetchGitHub = async () => {
    try {
      const [win, ios, mac, and] = await Promise.all([
        axios.get('https://api.github.com/repos/techmania-team/techmania/releases'),
        axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases'),
        axios.get('https://api.github.com/repos/fhalfkg/techmania/releases'),
        axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases'),
      ])

      tag.value.win = win.data[0].tag_name
      tag.value.ios = ios.data[0].tag_name
      tag.value.mac = mac.data[0].tag_name
      tag.value.android = and.data[0].tag_name

      publishDate.value.win = win.data[0].published_at
      publishDate.value.ios = ios.data[0].published_at
      publishDate.value.mac = mac.data[0].published_at
      publishDate.value.android = and.data[0].published_at
    } catch (error) {
      handleError(error)
    }
  }

  const clearData = () => {
    tag.value = {
      win: '',
      ios: '',
      android: '',
      mac: '',
    }
    publishDate.value = {
      win: '',
      ios: '',
      android: '',
      mac: '',
    }
    patterns.value = []
    skins.value = []
  }

  return {
    tag,
    publishDate,
    patterns,
    skins,
    setlists,
    fetchData,
    fetchGitHub,
    clearData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTempIndexStore, import.meta.hot))
}
