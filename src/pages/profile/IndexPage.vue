<template lang="pug">
q-page#profile
  //- Header
  q-parallax.header-parallax(:height="200")
    //- Header image background
    template(#media)
      img(src="/assets/header-profile.png")
    //- Header content
    template(#content)
      q-avatar(rounded size="100px")
        q-img(:src="profile.avatar" error-src="/assets/Logo_black.png")
      .text-h4.text-center.q-mt-md {{ profile.name }}
  section.q-mx-auto.padding.q-mt-lg
    .container
      .row
        .col-12
          q-tabs(align="justify" indicator-color="tech" v-model="tab" @update:model-value="setTab")
            q-tab(name="patterns" :label="$t('profile.tab.patterns')" icon="music_note")
              q-badge(color="tech" text-color="black" floating) {{ profile.patternCount }}
            q-tab(name="skins" :label="$t('profile.tab.skins')" icon="stars")
              q-badge(color="tech" text-color="black" floating) {{ profile.skinCount }}
            q-tab(name="comments" :label="$t('profile.tab.comments')" icon="comment")
              q-badge(color="tech" text-color="black" floating) {{ profile.commentCount }}
  section
    PatternsPage(v-if="tab === 'patterns'")
    SkinsPage(v-else-if="tab === 'skins'")
    CommentsPage(v-else-if="tab === 'comments'")
</template>

<script setup>
import { ref } from 'vue'
import { useMeta } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useTempProfileStore } from 'src/stores/temp-profile'
import PatternsPage from './PatternsPage.vue'
import SkinsPage from './SkinsPage.vue'
import CommentsPage from './CommentsPage.vue'
import { getI18nRoute } from 'src/i18n'

const profile = useTempProfileStore()
const route = useRoute()
const router = useRouter()

const metaData = {
  title: `TECHMANIA | ${profile.name}`,
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: `${profile.name}`,
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: `${profile.name}'s profile on TECHMANIA.`,
      'data-dynamic': true,
    },
    ogType: {
      property: 'og:type',
      content: 'website',
      'data-dynamic': true,
    },
    ogUrl: {
      property: 'og:url',
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
      'data-dynamic': true,
    },
    ogTitle: {
      property: 'og:title',
      content: `TECHMANIA | ${profile.name}`,
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: `${profile.name}'s profile on TECHMANIA.`,
      'data-dynamic': true,
    },
    ogImage: {
      property: 'og:image',
      content: profile.avatar,
      'data-dynamic': true,
    },
    twCard: {
      name: 'twitter:card',
      content: 'summary_large_image',
      'data-dynamic': true,
    },
    twUrl: {
      name: 'twitter:url',
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
      'data-dynamic': true,
    },
    twTitle: {
      name: 'twitter:title',
      content: `TECHMANIA | ${profile.name}`,
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: `${profile.name}'s profile on TECHMANIA.`,
      'data-dynamic': true,
    },
    twImage: {
      name: 'twitter:image',
      content: profile.avatar,
      'data-dynamic': true,
    },
  },
}
useMeta(metaData)

const tab = ref(route.params.tab || 'patterns')

const setTab = (tab) => {
  router.replace(getI18nRoute({ ...route, params: { ...route.params, tab } }))
}

defineOptions({
  async preFetch({ currentRoute, redirect }) {
    // Prefetch profile data
    const profile = useTempProfileStore()

    // Note:
    // Do not clear data here, as it will cause the page to flicker when navigating between tabs
    // profile.clearData()

    await profile.fetchProfile(currentRoute.params.id)

    // Check if profile exists
    if (profile._id.length === 0) {
      redirect('/404')
    }
  },
})
</script>
