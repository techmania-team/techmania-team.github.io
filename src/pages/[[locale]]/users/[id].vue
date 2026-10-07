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
import { useQuery } from '@pinia/colada'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DiscordAvatar from '@/components/DiscordAvatar.vue'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { getI18nRoute } from '@/i18n'
import { EMPTY_USER, userQuery } from '@/queries/user'
import { prefetchById } from '@/utils/prefetch'

const { t } = useI18n()
const route = useRoute('profile')

// Shared with preFetch below, and kept across tab changes by the cache, which
// is what the old store avoided clearing to stop the header from flickering
const { data } = useQuery(() => userQuery(route.params.id))
const profile = computed(() => data.value ?? EMPTY_USER)

useSeoMeta({
  title: () => t('profile.meta.title', { name: profile.value.name }),
  description: () => t('profile.meta.description', { name: profile.value.name }),
  image: () => profile.value.avatar,
  type: 'profile',
})

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

    // The profile has nothing of its own to show, its first tab does
    if (route.name === 'profile') {
      redirect(getI18nRoute({ name: 'profile-patterns', params: { id: route.params.id } }), 301)
      return
    }

    await prefetchById({ currentRoute, store }, route.params.id, userQuery)
  },
})
</script>

<route lang="yaml">
name: profile
meta:
  login: false
</route>
