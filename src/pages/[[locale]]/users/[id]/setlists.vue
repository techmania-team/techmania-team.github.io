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
import type { ISetlist } from '@/types/setlist'
import { useInfiniteQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SetlistCard from '@/components/SetlistCard.vue'
import * as setlistService from '@/services/setlist'
import { useUserStore } from '@/stores/user'

const route = useRoute('profile-setlists')
const user = useUserStore()

const PAGE_SIZE = 12

const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery({
  key: () => ['setlists', 'by-user', route.params.id],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await setlistService.search({
        submitter: route.params.id,
        start: pageParam,
        sort: -1,
        sortBy: 'createdAt',
        limit: PAGE_SIZE,
      })
    ).data.result,
  // A short page means we reached the end
  getNextPageParam: (lastPage: ISetlist[], _allPages, lastPageParam) =>
    lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined,
})

const setlists = computed(() => data.value?.pages.flat() ?? [])

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!hasNextPage.value) return done(true)
  await loadNextPage()
  done(!hasNextPage.value)
}
</script>

<route lang="yaml">
name: profile-setlists
meta:
  login: false
</route>
