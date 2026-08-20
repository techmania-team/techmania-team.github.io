<template lang="pug">
#profile-patterns
  .container
    .text-center.q-mt-md.text-body1(v-if="patterns.length === 0 && scrollDisable") {{ $t('profile.patterns.notFound') }}
    q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
      .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(pattern) in patterns" :key="pattern._id")
        PatternCard(:pattern="pattern" :mine="route.params.id === user._id")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup lang="ts">
import type { IPattern } from '@/types/pattern'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import PatternCard from '@/components/PatternCard.vue'
import * as patternService from '@/services/pattern'
import { useUserStore } from '@/stores/user'
import { handleError } from '@/utils/handleError'

const route = useRoute('profile-patterns')
const user = useUserStore()

const patterns = ref<IPattern[]>([])
const scrollDisable = ref(false)

const fetchPatterns = async (start = 0) => {
  try {
    const { data } = await patternService.search({
      submitter: route.params.id,
      start: start,
      sort: -1,
      sortBy: 'createdAt',
      limit: 12,
    })

    if (data.result.length > 0) patterns.value = patterns.value.concat(data.result)
    else scrollDisable.value = true
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  }
}

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  await fetchPatterns((index - 1) * 12)
  done()
}
</script>

<route lang="yaml">
name: profile-patterns
meta:
  login: false
</route>
