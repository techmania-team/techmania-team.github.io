<template lang="pug">
NotFound
</template>

<script setup lang="ts">
import NotFound from '@/components/NotFound.vue'
</script>

<route lang="yaml">
name: error-404
path: /:catchAll(.*)*
meta:
  layout: empty
  login: false
</route>
