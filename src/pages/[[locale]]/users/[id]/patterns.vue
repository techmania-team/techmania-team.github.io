<template lang="pug">
#profile-patterns
  .container
    .text-center.q-mt-md.text-body1(v-if="!isPending && patterns.length === 0") {{ $t('profile.patterns.notFound') }}
    q-infinite-scroll.row.q-my-md.q-col-gutter-md(@load="loadScroll" :offset="200" :disable="!hasNextPage")
      .col-12.col-sm-6.col-md-4.col-lg-3(v-for="(pattern) in patterns" :key="pattern._id")
        PatternCard(:pattern="pattern" :mine="route.params.id === user._id")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup lang="ts">
import type { IPattern } from '@/types/pattern'
import { useInfiniteQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PatternCard from '@/components/PatternCard.vue'
import * as patternService from '@/services/pattern'
import { useUserStore } from '@/stores/user'

const route = useRoute('profile-patterns')
const user = useUserStore()

const PAGE_SIZE = 12

const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery({
  key: () => ['patterns', 'by-user', route.params.id],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await patternService.search({
        submitter: route.params.id,
        start: pageParam,
        sort: -1,
        sortBy: 'createdAt',
        limit: PAGE_SIZE,
      })
    ).data.result,
  // A short page means we reached the end
  getNextPageParam: (lastPage: IPattern[], _allPages, lastPageParam) =>
    lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined,
})

const patterns = computed(() => data.value?.pages.flat() ?? [])

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
name: profile-patterns
meta:
  login: false
</route>
