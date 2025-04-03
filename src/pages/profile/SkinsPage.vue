<template lang="pug">
#profile-skins
  .container
    .text-center.q-mt-md.text-body1(v-if="skins.length === 0 && scrollDisable") {{ $t('profile.skins.notFound') }}
    q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
      .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(skin) in skins" :key="skin.id")
        SkinCard(:skin="skin")
      template(#loading)
        q-spinner-dots(color="tech" size="40px")
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { handleError } from 'src/utils/handleError'
import api from 'src/utils/api'
import SkinCard from 'src/components/SkinCard.vue'

const route = useRoute()

const skins = ref([])
const scrollDisable = ref(false)

const fetchSkins = async (start = 0) => {
  try {
    const { data } = await api.get('/skins', {
      params: {
        submitter: route.params.id,
        start: start,
        sort: -1,
        sortBy: 'createdAt',
        limit: 12,
      },
    })

    if (data.result.length > 0) skins.value = skins.value.concat(data.result)
    else scrollDisable.value = true
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  }
}

const loadScroll = async (index, done) => {
  await fetchSkins((index - 1) * 12)
  done()
}
</script>
