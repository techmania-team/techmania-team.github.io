<template lang="pug">
#profile-skins
  .container
    .text-center.q-mt-md.text-body1(v-if="skins.length === 0 && scrollDisable") {{ $t('profile.skins.notFound') }}
    q-infinite-scroll.row.q-my-md.q-col-gutter-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
      .col-12.col-sm-6.col-md-4.col-lg-3(v-for="(skin) in skins" :key="skin._id")
        SkinCard(:skin="skin" :mine="route.params.id === user._id")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup lang="ts">
import type { ISkin } from '@/types/skin'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SkinCard from '@/components/SkinCard.vue'
import * as skinService from '@/services/skin'
import { useUserStore } from '@/stores/user'
import { handleError } from '@/utils/handleError'

const route = useRoute('profile-skins')
const user = useUserStore()

const skins = ref<ISkin[]>([])
const scrollDisable = ref(false)

const fetchSkins = async (start = 0) => {
  try {
    const { data } = await skinService.search({
      submitter: route.params.id,
      start: start,
      sort: -1,
      sortBy: 'createdAt',
      limit: 12,
    })

    if (data.result.length > 0) skins.value = skins.value.concat(data.result)
    else scrollDisable.value = true
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  }
}

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  await fetchSkins((index - 1) * 12)
  done()
}
</script>

<route lang="yaml">
name: profile-skins
meta:
  login: false
</route>
