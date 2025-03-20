<template lang="pug">
q-page#index
  //- Header
  q-parallax.header-parallax
    //- Header Video background
    template(#media)
      video(src="/assets/header.mp4" autoplay loop muted playsinline webkit-playsinline)
    //- Header content
    template(#content)
      .absolute.column.items-center.text-center
        //- Logo
        img#logo(src="/assets/Logo.png")
        //- Windows
        div(v-if="platform === 'windows'")
          //- Download
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://github.com/macmillan333/techmania/releases/' target='_blank')
              q-icon(left name="fab fa-windows" )
              div {{ $t('indexPage.download') }}
          //- Version and release date
          p
            | {{ $t('indexPage.latestVersion') }}: {{ tag.win }}
            br
            | {{ $t('indexPage.latestReleaseDate') }}: {{ published.win }}
            br
            //- Platform switch
            a(href="#" @click.prevent="platform = 'android'") Android
            | &emsp;
            a(href="#" @click.prevent="platform = 'ios'") iOS
            | &emsp;
            a(href="#" @click.prevent="platform = 'mac'") mac
        //- Android
        div(v-else-if="platform === 'android'")
          //- Download
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://github.com/rogeraabbccdd/techmania/releases/' target='_blank')
              q-icon(left name="android" )
              div {{ $t('indexPage.download') }}
          //- Version and release date
          p
            | {{ $t('indexPage.latestVersion') }}: {{ tag.android }}
            br
            | {{ $t('indexPage.latestReleaseDate') }}: {{ published.android }}
            br
            //- Platform switch
            a(href="#" @click.prevent="platform = 'windows'") Windows
            | &emsp;
            a(href="#" @click.prevent="platform = 'ios'") iOS
            | &emsp;
            a(href="#" @click.prevent="platform = 'mac'") mac
        //- iOS
        div(v-else-if="platform === 'ios'")
          //- Download
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://apps.apple.com/app/id1581524513' target='_blank')
              q-icon(left name="img:/assets/icons/ios.svg" )
              div {{ $t('indexPage.download') }}
          //- Version and release date
          p
            | {{ $t('indexPage.latestVersion') }}: {{ tag.ios }}
            br
            | {{ $t('indexPage.latestReleaseDate') }}: {{ published.ios }}
            br
            //- Platform switch
            a(href="#" @click.prevent="platform = 'windows'") Windows
            | &emsp;
            a(href="#" @click.prevent="platform = 'android'") Android
            | &emsp;
            a(href="#" @click.prevent="platform = 'mac'") mac
        //- Mac
        div(v-else-if="platform === 'mac'")
          //- Download
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://github.com/fhalfkg/techmania/releases/' target='_blank')
              q-icon(left name="fab fa-apple" )
              div {{ $t('indexPage.download') }}
          //- Version and release date
          p
            | {{ $t('indexPage.latestVersion') }}: {{ tag.mac }}
            br
            | {{ $t('indexPage.latestReleaseDate') }}: {{ published.mac }}
            br
            //- Platform switch
            a(href="#" @click.prevent="platform = 'windows'") Windows
            | &emsp;
            a(href="#" @click.prevent="platform = 'android'") Android
            | &emsp;
            a(href="#" @click.prevent="platform = 'ios'") iOS
  //- Patterns
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('indexPage.newPatterns') }}
          q-separator
          .row
            .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(pattern) in patterns" :key="pattern._id")
              PatternCard(:pattern="pattern" :mine="false")
  //- Skins
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('indexPage.newSkins') }}
          q-separator
          .row
            .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(skin) in skins" :key="skin._id")
              SkinCard(:skin="skin" :mine="false")
  //- Videos
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('indexPage.videos') }}
          q-separator
          .row
            .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(video, idx) in videos" :key="idx")
              q-video(:ratio="16/9" :src="video")
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useMeta, useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from 'src/stores/settings'
import { useTempIndexStore } from 'src/stores/temp-index'
import PatternCard from 'src/components/PatternCard.vue'
import SkinCard from 'src/components/SkinCard.vue'

const $q = useQuasar()
const route = useRoute()
const settings = useSettingsStore()
const tempIndex = useTempIndexStore()
const { tag, patterns, skins, publishDate } = storeToRefs(tempIndex)

const metaData = {
  title: 'TECHMANIA',
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: 'TECHMANIA',
    },
    description: {
      name: 'description',
      content: 'Official TECHMANIA Website',
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
      content: 'TECHMANIA',
    },
    ogDescription: {
      property: 'og:description',
      content: 'Official TECHMANIA Website',
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
      content: 'TECHMANIA',
    },
    twDescription: {
      name: 'twitter:description',
      content: 'Official TECHMANIA Website',
    },
    twImage: {
      name: 'twitter:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
  },
}
useMeta(metaData)

// Selected platform
const platform = ref('windows')
if ($q.platform.is.android) platform.value = 'android'
else if ($q.platform.is.ios) platform.value = 'ios'
else if ($q.platform.is.mac) platform.value = 'mac'

// Published dates
const published = computed(() => {
  return {
    win:
      publishDate.value.win.length > 0
        ? new Date(publishDate.value.win).toLocaleString(settings.locale)
        : '-',
    android:
      publishDate.value.android.length > 0
        ? new Date(publishDate.value.android).toLocaleString(settings.locale)
        : '-',
    ios:
      publishDate.value.ios.length > 0
        ? new Date(publishDate.value.ios).toLocaleString(settings.locale)
        : '-',
    mac:
      publishDate.value.mac.length > 0
        ? new Date(publishDate.value.mac).toLocaleString(settings.locale)
        : '-',
  }
})

// Videos
const videos = [
  'https://www.youtube.com/embed/MtkxhEmCWwU',
  'https://www.youtube.com/embed/1v_LVASKrsQ',
  'https://www.youtube.com/embed/czRzORpQy3U',
  'https://www.youtube.com/embed/3a3XRaqvsWc',
  'https://www.youtube.com/embed/74f7p-t3YeU',
  'https://www.youtube.com/embed/fmJ_BRHP3w0',
  'https://www.youtube.com/embed/peH2TjiPSfI',
  'https://www.youtube.com/embed/3qlUwAas-wY',
]

defineOptions({
  async preFetch() {
    // Prefetch patterns, skins
    const tempIndex = useTempIndexStore()
    await tempIndex.fetchData()
  },
})

onMounted(() => {
  // Fetch Release data from GitHub
  // if (process.env.CLIENT) tempIndex.fetchGitHub()
})

onUnmounted(() => {
  // Clear temp index data
  tempIndex.clearData()
})
</script>
