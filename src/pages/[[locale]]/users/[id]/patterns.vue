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
import { useInfiniteQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PatternCard from '@/components/PatternCard.vue'
import { patternsByUserQuery } from '@/queries/pattern'
import { useUserStore } from '@/stores/user'

const route = useRoute('profile-patterns')
const user = useUserStore()

const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery(() =>
  patternsByUserQuery(route.params.id),
)

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
