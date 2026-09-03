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
            | {{ $t('indexPage.latestVersion') }}: {{ releases.win.tag }}
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
            | {{ $t('indexPage.latestVersion') }}: {{ releases.android.tag }}
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
            | {{ $t('indexPage.latestVersion') }}: {{ releases.ios.tag }}
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
            | {{ $t('indexPage.latestVersion') }}: {{ releases.mac.tag }}
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
          .row.q-my-md.q-col-gutter-md
            .col-12.col-md-6.col-lg-3(v-for="(pattern) in patterns" :key="pattern._id")
              PatternCard(:pattern="pattern" :mine="false")
  //- Skins
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('indexPage.newSkins') }}
          q-separator
          .row.q-my-md.q-col-gutter-md
            .col-12.col-md-6.col-lg-3(v-for="(skin) in skins" :key="skin._id")
              SkinCard(:skin="skin" :mine="false")
  //- Setlists
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('indexPage.newSetlists') }}
          q-separator
          .row.q-my-md.q-col-gutter-md
            .col-12.col-md-6.col-lg-3(v-for="(setlist) in setlists" :key="setlist._id")
              SetlistCard(:setlist="setlist" :mine="false")
  //- Videos
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('indexPage.videos') }}
          q-separator
          .row.q-my-md.q-col-gutter-md
            .col-12.col-md-6.col-lg-3(v-for="(video, idx) in videos" :key="idx")
              YoutubeVideo(:name="video.name" :ytid="video.ytid")
              p.text-center.q-mt-md {{ video.name }}
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMeta, useQuasar } from 'quasar'
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import PatternCard from '@/components/PatternCard.vue'
import SetlistCard from '@/components/SetlistCard.vue'
import SkinCard from '@/components/SkinCard.vue'
import YoutubeVideo from '@/components/YoutubeVideo.vue'
import { useTempIndexStore } from '@/stores/temp-index'
import { toLocaleString } from '@/utils/date'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const tempIndex = useTempIndexStore()
const { releases, patterns, skins, setlists } = storeToRefs(tempIndex)

const metaData = () => ({
  title: t('indexPage.meta.title'),
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: t('indexPage.meta.title'),
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: t('indexPage.meta.description'),
      'data-dynamic': true,
    },
    ogType: {
      property: 'og:type',
      content: 'website',
    },
    ogUrl: {
      property: 'og:url',
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    ogTitle: {
      property: 'og:title',
      content: t('indexPage.meta.title'),
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: t('indexPage.meta.description'),
      'data-dynamic': true,
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
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    twTitle: {
      name: 'twitter:title',
      content: t('indexPage.meta.title'),
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: t('indexPage.meta.description'),
      'data-dynamic': true,
    },
    twImage: {
      name: 'twitter:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
  },
})
useMeta(metaData)

// Selected platform
const platform = ref('windows')
if ($q.platform.is.android) platform.value = 'android'
else if ($q.platform.is.ios) platform.value = 'ios'
else if ($q.platform.is.mac) platform.value = 'mac'

// Published dates
const published = computed(() => {
  return {
    win: releases.value.win.date.length > 0 ? toLocaleString(releases.value.win.date) : '-',
    android:
      releases.value.android.date.length > 0 ? toLocaleString(releases.value.android.date) : '-',
    ios: releases.value.ios.date.length > 0 ? toLocaleString(releases.value.ios.date) : '-',
    mac: releases.value.mac.date.length > 0 ? toLocaleString(releases.value.mac.date) : '-',
  }
})

// Videos
const videos = [
  { name: 'TECHMANIA 1.0 Update Trailer', ytid: 'MtkxhEmCWwU' },
  { name: 'TECHMANIA | f for fun', ytid: '1v_LVASKrsQ' },
  { name: 'TECHMANIA | v (Game Mix)', ytid: 'czRzORpQy3U' },
  { name: 'TECHMANIA | Yin-Yang Specialist (MUG ver)', ytid: '3a3XRaqvsWc' },
  { name: 'TECHMANIA | Run 4 Cover', ytid: '74f7p-t3YeU' },
  { name: 'TECHMANIA | Ash Barrens', ytid: 'fmJ_BRHP3w0' },
  { name: 'TECHMANIA 101 #1: Getting started', ytid: 'peH2TjiPSfI' },
  { name: 'TECHMANIA tutorial: Touch', ytid: '3qlUwAas-wY' },
]

defineOptions({
  async preFetch({ store }) {
    // Prefetch patterns, skins
    const tempIndex = useTempIndexStore(store)
    await tempIndex.fetchData()
  },
})

onUnmounted(() => {
  // Clear temp index data
  // Note:
  // Do not clear data here
  // It will cause GitHub API rate limit exceeded if user navigates to this page frequently
  // tempIndex.clearData()
})
</script>

<route lang="yaml">
name: index
meta:
  login: false
</route>
