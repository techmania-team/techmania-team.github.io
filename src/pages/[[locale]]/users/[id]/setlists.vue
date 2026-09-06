<template lang="pug">
#profile-setlists
  .container
    .text-center.q-mt-md.text-body1(v-if="!isPending && setlists.length === 0") {{ $t('profile.setlists.notFound') }}
    q-infinite-scroll.row.q-my-md.q-col-gutter-md(@load="loadScroll" :offset="200" :disable="!hasNextPage")
      .col-12.col-sm-6.col-md-4.col-lg-3(v-for="(setlist) in setlists" :key="setlist._id")
        SetlistCard(:setlist="setlist" :mine="route.params.id === user._id")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup lang="ts">
import { useInfiniteQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SetlistCard from '@/components/SetlistCard.vue'
import { setlistsByUserQuery } from '@/queries/setlist'
import { useUserStore } from '@/stores/user'

const route = useRoute('profile-setlists')
const user = useUserStore()

const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery(() =>
  setlistsByUserQuery(route.params.id),
)

const setlists = computed(() => data.value?.pages.flat() ?? [])

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!hasNextPage.value) return done(true)
  // cancelRefetch: false makes a concurrent trigger await the request that is
  // already running. The default aborts it and starts a new one, which turns
  // repeated q-infinite-scroll triggers into a storm of cancelled requests.
  await loadNextPage({ cancelRefetch: false })
  done(!hasNextPage.value)
}
</script>

<route lang="yaml">
name: profile-setlists
meta:
  login: false
</route>
