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
          q-tabs(align="justify" indicator-color="tech")
            q-route-tab(
              :to="getI18nRoute({ name: 'profile-patterns', params: { id: route.params.id } })"
              :label="$t('profile.tab.patterns')"
              icon="music_note"
              exact
            )
              q-badge(color="tech" text-color="black" floating) {{ profile.patternCount }}
            q-route-tab(
              :to="getI18nRoute({ name: 'profile-skins', params: { id: route.params.id } })"
              :label="$t('profile.tab.skins')"
              icon="stars"
              exact
            )
              q-badge(color="tech" text-color="black" floating) {{ profile.skinCount }}
            q-route-tab(
              :to="getI18nRoute({ name: 'profile-setlists', params: { id: route.params.id } })"
              :label="$t('profile.tab.setlists')"
              icon="list_alt"
              exact
            )
              q-badge(color="tech" text-color="black" floating) {{ profile.setlistCount }}
            q-route-tab(
              :to="getI18nRoute({ name: 'profile-comments', params: { id: route.params.id } })"
              :label="$t('profile.tab.comments')"
              icon="comment"
              exact
            )
              q-badge(color="tech" text-color="black" floating) {{ profile.commentCount }}
  section
    router-view
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoadedTyped } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'
import { useMeta } from 'quasar'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DiscordAvatar from '@/components/DiscordAvatar.vue'
import { getI18nRoute } from '@/i18n'
import { useTempUserStore } from '@/stores/temp-user'

const { t } = useI18n()
const profile = useTempUserStore()
const route = useRoute('profile')

const metaData = () => ({
  title: t('profile.meta.title', { name: profile.name }),
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: t('profile.meta.title', { name: profile.name }),
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: t('profile.meta.description', { name: profile.name }),
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
      content: t('profile.meta.title', { name: profile.name }),
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: t('profile.meta.description', { name: profile.name }),
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
    },
    twUrl: {
      name: 'twitter:url',
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    twTitle: {
      name: 'twitter:title',
      content: t('profile.meta.title', { name: profile.name }),
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: t('profile.meta.description', { name: profile.name }),
      'data-dynamic': true,
    },
    twImage: {
      name: 'twitter:image',
      content: profile.avatar,
      'data-dynamic': true,
    },
  },
})
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

defineOptions({
  async preFetch({ currentRoute, redirect, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<RouteNamedMap, 'profile'>
    // Prefetch profile data
    const profile = useTempUserStore(store)

    // Note:
    // Do not clear data here, as it will cause the page to flicker when navigating between tabs
    // profile.clearData()
    if (route.params.id) {
      await profile.fetchProfile(route.params.id)
    } else {
      redirect({ name: 'index' })
      return
    }

    if (route.name === 'profile') {
      redirect(getI18nRoute({ name: 'profile-patterns', params: { id: route.params.id } }))
    }

    // Check if profile exists
    if (profile._id.length === 0) {
      redirect({ name: 'index' })
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
