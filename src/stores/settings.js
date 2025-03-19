import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { Lang } from 'quasar'

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const locale = ref(Lang.getLocale())

    return {
      locale,
    }
  },
  {
    persist: {
      key: 'techmania-settings',
    },
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
