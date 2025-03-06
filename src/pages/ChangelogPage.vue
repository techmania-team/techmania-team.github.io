<template lang="pug">
q-page#changelog
  .container
    .row
      //- Title
      .col-12.q-mx-auto
        h4.text-center {{ $t('nav.changelog') }}
        q-separator.q-my-md
        div(v-if="releases.length === 0 && !error")
          q-item(v-for="i in 3" :key="i")
            q-item-section(avatar)
              q-skeleton(type='QAvatar')
            q-item-section
              q-item-label
                q-skeleton(type='text')
              q-item-label(caption)
                q-skeleton(type='text' width='65%')
        div(v-if="error")
          h6.text-center Failed to fetch data from GitHub.
        //- Timeline
        q-timeline(color="tech" v-else transition-show="fade")
          q-timeline-entry(
            v-for="release in releases"
            :key="release.node_id"
            :subtitle="new Date(release.published_at).toLocaleString(settings.locale)"
          )
            template(#title)
              //- Timeline title
              h4.q.q-timeline__title
                //- Release name
                | {{ release.name.length === 0 ? release.tag_name : release.name }}
                | &nbsp;
                //- Download button
                q-btn.q-mr-xs(flat round icon="download" color="tech" :href="release.html_url" target="_blank")
                //- Downloads count
                img(:src="'https://img.shields.io/github/downloads/techmania-team/techmania/' + release.tag_name +'/total?label=' + $t('changelog.downloads')")
            q-separator
            //- Detail collapse button
            q-btn.full-width(flat align="between" @click="release.expand = !release.expand" :label="release.expand ? $t('changelog.hideDetail') : $t('changelog.showDetail')" :icon-right="release.expand ? 'expand_less' : 'expand_more'")
            //- Release detail
            q-slide-transition
              div(v-if="release.expand")
                q-markdown.q-pa-md(:src="release.body")
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMeta } from 'quasar'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useSettingsStore } from 'src/stores/settings'

const route = useRoute()
const settings = useSettingsStore()

const metaData = {
  title: 'TECHMANIA | Changelog',
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: 'TECHMANIA | Changelog',
    },
    description: {
      name: 'description',
      content: 'Changelog of TECHMANIA.',
    },
    ogType: {
      property: 'og:type',
      content: 'website',
    },
    ogUrl: {
      property: 'og:url',
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
    },
    ogTitle: {
      property: 'og:title',
      content: 'TECHMANIA | Changelog',
    },
    ogDescription: {
      property: 'og:description',
      content: 'Changelog of TECHMANIA.',
    },
    ogImage: {
      property: 'og:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
    twCard: {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    twUrl: {
      name: 'twitter:url',
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
    },
    twTitle: {
      name: 'twitter:title',
      content: 'TECHMANIA | Changelog',
    },
    twDescription: {
      name: 'twitter:description',
      content: 'Changelog of TECHMANIA.',
    },
    twImage: {
      name: 'twitter:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
  },
}
useMeta(metaData)

const releases = ref([])
const error = ref(false)

onMounted(async () => {
  if (process.env.CLIENT) {
    try {
      // Get releases from GitHub
      const { data } = await axios.get(
        'https://api.github.com/repos/techmania-team/techmania/releases',
      )
      releases.value = data.map((data) => {
        data.expand = false
        return data
      })
    } catch (error) {
      error.value = true
    }
  }
})
</script>
