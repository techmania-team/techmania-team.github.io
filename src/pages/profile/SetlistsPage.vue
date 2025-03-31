<template lang="pug">
#profile-setlists
  .container
    .text-center.q-mt-md.text-body1(v-if="setlists.length === 0 && scrollDisable") {{ $t('profile.setlists.notFound') }}
    q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
      .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(setlist) in setlists" :key="setlist.id")
        SetlistCard(:setlist="setlist" :mine="false")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { handleError } from 'src/utils/handleError'
import api from 'src/utils/api'
import SetlistCard from 'src/components/SetlistCard.vue'

const route = useRoute()

const setlists = ref([])
const scrollDisable = ref(false)

const fetchSetlists = async (start = 0) => {
  try {
    const { data } = await api.get('/setlists', {
      params: {
        submitter: route.params.id,
        start: start,
        sort: -1,
        sortBy: 'createdAt',
        limit: 12,
      },
    })
    console.log(data.result)
    if (data.result.length > 0) setlists.value = setlists.value.concat(data.result)
    else scrollDisable.value = true
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  }
}

const loadScroll = async (index, done) => {
  await fetchSetlists((index - 1) * 12)
  done()
}
</script>
