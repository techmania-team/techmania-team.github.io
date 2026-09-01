<template lang="pug">
#profile-setlists
  .container
    .text-center.q-mt-md.text-body1(v-if="setlists.length === 0 && scrollDisable") {{ $t('profile.setlists.notFound') }}
    q-infinite-scroll.row.q-my-md.q-col-gutter-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
      .col-12.col-sm-6.col-md-4.col-lg-3(v-for="(setlist) in setlists" :key="setlist._id")
        SetlistCard(:setlist="setlist" :mine="route.params.id === user._id")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup lang="ts">
import type { ISetlist } from '@/types/setlist'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SetlistCard from '@/components/SetlistCard.vue'
import * as setlistService from '@/services/setlist'
import { useUserStore } from '@/stores/user'
import { handleError } from '@/utils/handleError'

const route = useRoute('profile-setlists')
const user = useUserStore()

const setlists = ref<ISetlist[]>([])
const scrollDisable = ref(false)

const fetchSetlists = async (start = 0) => {
  try {
    const { data } = await setlistService.search({
      submitter: route.params.id,
      start: start,
      sort: -1,
      sortBy: 'createdAt',
      limit: 12,
    })

    if (data.result.length > 0) setlists.value = setlists.value.concat(data.result)
    else scrollDisable.value = true
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  }
}

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  await fetchSetlists((index - 1) * 12)
  done()
}
</script>

<route lang="yaml">
name: profile-setlists
meta:
  login: false
</route>
