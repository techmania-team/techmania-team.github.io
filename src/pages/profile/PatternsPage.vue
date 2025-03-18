<template lang="pug">
#profile-patterns
  .container
    .text-center.q-mt-md.text-body1(v-if="patterns.length === 0 && scrollDisable") {{ $t('patterns.notFound') }}
    q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
      .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(pattern) in patterns" :key="pattern.id")
        PatternCard(:pattern="pattern")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import handleError from 'src/utils/handleError'
import api from 'src/utils/api'
import PatternCard from 'src/components/PatternCard.vue'

const route = useRoute()

const patterns = ref([])
const scrollDisable = ref(false)

const fetchPatterns = async (start = 0) => {
  try {
    const { data } = await api.get('/patterns', {
      params: {
        submitter: route.params.id,
        start: start,
        sort: -1,
        sortBy: 'createdAt',
        limit: 12,
      },
    })

    if (data.result.length > 0) patterns.value = patterns.value.concat(data.result)
    else scrollDisable.value = true
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  }
}

const loadScroll = async (index, done) => {
  await fetchPatterns((index - 1) * 12)
  done()
}
</script>
