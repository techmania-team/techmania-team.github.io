import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { Lang } from 'quasar'

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref(Lang.getLocale())

  return {
    locale,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
