<template lang="pug">
router-view
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useSettingsStore } from 'src/stores/settings'

const i18n = useI18n()
const $q = useQuasar()
const settings = useSettingsStore()

onMounted(async () => {
  if (process.env.CLIENT) {
    if (settings.locale) {
      i18n.locale.value = settings.locale
    } else {
      const localeDetected = $q.lang.getLocale()
      settings.locale = localeDetected
      i18n.locale.value = localeDetected
    }
  }
})
</script>
