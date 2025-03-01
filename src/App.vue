<template lang="pug">
  router-view
  </template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'src/stores/user'

const route = useRoute()
const $q = useQuasar()
const i18n = useI18n()
const user = useUserStore()

onMounted(async () => {
  if (process.env.CLIENT) {
    if (user.locale) {
      i18n.locale.value = user.locale
    } else {
      const localeDetected = $q.lang.getLocale()
      user.locale = localeDetected
      i18n.locale.value = localeDetected
    }

    await user.verify(route.query)
  }
})
</script>
