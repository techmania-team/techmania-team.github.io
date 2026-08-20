<template lang="pug">
q-page#profile
  //- Header
  q-parallax.header-parallax(:height="200")
    //- Header image background
    template(#media)
      img(src="/assets/header-profile.png")
    //- Header content
    template(#content)
      DiscordAvatar(:avatar="profile.avatar" :avatar-options="{ rounded: true, size: '100px' }")
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
            q-tab(name="setlists" :label="$t('profile.tab.setlists')" icon="list_alt")
              q-badge(color="tech" text-color="black" floating) {{ profile.setlistCount }}
            q-tab(name="comments" :label="$t('profile.tab.comments')" icon="comment")
              q-badge(color="tech" text-color="black" floating) {{ profile.commentCount }}
  section
    router-view
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoadedTyped } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'
import { useMeta } from 'quasar'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DiscordAvatar from '@/components/DiscordAvatar.vue'
import { getI18nRoute } from '@/i18n'
import { useTempProfileStore } from '@/stores/temp-profile'

const profile = useTempProfileStore()
const route = useRoute('profile')
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
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
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
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
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

const tab = ref('patterns')
watch(
  () => route.name,
  (name) => {
    if (!name) return

    if (name === 'profile-skins') tab.value = 'skins'
    else if (name === 'profile-setlists') tab.value = 'setlists'
    else if (name === 'profile-comments') tab.value = 'comments'
    else tab.value = 'patterns'
  },
  { immediate: true },
)

const setTab = async (tab: 'patterns' | 'skins' | 'setlists' | 'comments') => {
  if (!route.params.id) {
    return await router.push('/404')
  }

  switch (tab) {
    case 'patterns':
      await router.push(getI18nRoute({ name: 'profile-patterns', params: { id: route.params.id } }))
      break
    case 'skins':
      await router.push(getI18nRoute({ name: 'profile-skins', params: { id: route.params.id } }))
      break
    case 'setlists':
      await router.push(getI18nRoute({ name: 'profile-setlists', params: { id: route.params.id } }))
      break
    case 'comments':
      await router.push(getI18nRoute({ name: 'profile-comments', params: { id: route.params.id } }))
      break
  }
}

defineOptions({
  async preFetch({ currentRoute, redirect, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<RouteNamedMap, 'profile'>
    // Prefetch profile data
    const profile = useTempProfileStore(store)

    // Note:
    // Do not clear data here, as it will cause the page to flicker when navigating between tabs
    // profile.clearData()
    if (route.params.id) {
      await profile.fetchProfile(route.params.id)
    } else {
      redirect('/404')
      return
    }

    if (route.name === 'profile') {
      redirect(getI18nRoute({ name: 'profile-patterns', params: { id: route.params.id } }))
    }

    // Check if profile exists
    if (profile._id.length === 0) {
      redirect('/404')
      return
    }
  },
})
</script>

<route lang="yaml">
name: profile
meta:
  login: false
</route>
