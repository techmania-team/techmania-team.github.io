<template lang="pug">
q-page.bg-techgrey.text-white.text-center.q-pa-md.flex.flex-center
  div
    div(style='font-size: 30vh') 404
    .text-h2(style='opacity:.4') Oops. Nothing here...
    q-btn.q-mt-xl(color='tech' text-color='black' unelevated to='/' label='Go Home' no-caps)
</template>

<script setup lang="ts">
import { useSSRContext } from 'vue'
import { useSeoMeta } from '@/composables/useSeoMeta'

// Wherever this renders on the server, the response is a real 404
if (import.meta.env.QUASAR_SERVER) {
  useSSRContext()?.res.status(404)
}

useSeoMeta({
  title: 'TECHMANIA | 404',
  description: 'Oops. Nothing here...',
  noindex: true,
})
</script>
