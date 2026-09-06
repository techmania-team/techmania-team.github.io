<template lang="pug">
#profile-skins
  .container
    .text-center.q-mt-md.text-body1(v-if="!isPending && skins.length === 0") {{ $t('profile.skins.notFound') }}
    q-infinite-scroll.row.q-my-md.q-col-gutter-md(@load="loadScroll" :offset="200" :disable="!hasNextPage")
      .col-12.col-sm-6.col-md-4.col-lg-3(v-for="(skin) in skins" :key="skin._id")
        SkinCard(:skin="skin" :mine="route.params.id === user._id")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup lang="ts">
import type { ISkin } from '@/types/skin'
import { useInfiniteQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SkinCard from '@/components/SkinCard.vue'
import * as skinService from '@/services/skin'
import { useUserStore } from '@/stores/user'

const route = useRoute('profile-skins')
const user = useUserStore()

const PAGE_SIZE = 12

const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery({
  key: () => ['skins', 'by-user', route.params.id],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await skinService.search({
        submitter: route.params.id,
        start: pageParam,
        sort: -1,
        sortBy: 'createdAt',
        limit: PAGE_SIZE,
      })
    ).data.result,
  // A short page means we reached the end
  getNextPageParam: (lastPage: ISkin[], _allPages, lastPageParam) =>
    lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined,
})

const skins = computed(() => data.value?.pages.flat() ?? [])

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!hasNextPage.value) return done(true)
  await loadNextPage()
  done(!hasNextPage.value)
}
</script>

<route lang="yaml">
name: profile-skins
meta:
  login: false
</route>
