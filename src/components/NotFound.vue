<template lang="pug">
q-page.bg-techgrey.text-white.text-center.q-pa-md.flex.flex-center
  div
    div(style='font-size: 30vh') 404
    .text-h2(style='opacity:.4') {{ $t('notFoundPage.message') }}
    q-btn.q-mt-xl(color='tech' text-color='black' unelevated :to="getI18nRoute({ name: 'index' })" :label="$t('notFoundPage.home')" no-caps)
</template>

<script setup lang="ts">
import { useSSRContext } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { getI18nRoute } from '@/i18n'

const { t } = useI18n()

// Wherever this renders on the server, the response is a real 404
if (import.meta.env.QUASAR_SERVER) {
  useSSRContext()?.res.status(404)
}

useSeoMeta({
  title: 'TECHMANIA | 404',
  description: () => t('notFoundPage.message'),
  noindex: true,
})
</script>
