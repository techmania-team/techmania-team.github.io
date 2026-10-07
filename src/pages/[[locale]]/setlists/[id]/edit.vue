<template lang="pug">
q-page#setlistForm
  q-no-ssr
    //- Header
    q-parallax.header-parallax(:height="200")
      //- Header image background
      template(#media)
        img(src="/assets/header-setlist.png")
      //- Header content
      template(#content)
        .column.items-center.q-mb-md
          .text-h4.text-center {{ $t('setlistFormPage.titleEdit') }}
    SetlistForm(:setlist="setlist")
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoadedTyped } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'
import { useQuery, useQueryCache } from '@pinia/colada'
import validator from 'validator'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import SetlistForm from '@/components/SetlistForm.vue'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { EMPTY_SETLIST, setlistQuery } from '@/queries/setlist'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { t } = useI18n()
const route = useRoute('setlist-form-edit')
// preFetch has already filled this entry in, so nothing is fetched twice
const { data } = useQuery(() => setlistQuery(route.params.id))
const setlist = computed(() => data.value ?? EMPTY_SETLIST)

const title = computed(() =>
  user.isLogin
    ? t('setlistFormPage.meta.title', { text: t('setlistFormPage.titleEdit') })
    : t('setlistFormPage.meta.title', { text: t('setlistFormPage.meta.login') }),
)

const description = computed(() =>
  user.isLogin
    ? t('setlistFormPage.meta.description', { text: t('setlistFormPage.titleEdit') })
    : t('setlistFormPage.meta.description', { text: t('setlistFormPage.meta.login') }),
)

useSeoMeta({
  title,
  description,
  noindex: true,
})

defineOptions({
  async preFetch({ currentRoute, redirect, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<
      RouteNamedMap,
      'setlist-form-edit'
    >

    const user = useUserStore(store)

    // New setlist form, no need to prefetch data
    if (!route.params.id) return

    // Check if ID is valid, redirect to 404 if not
    if (route.params.id && !validator.isMongoId(route.params.id)) {
      redirect({ name: 'index' })
      return
    }

    // Note:
    // ssrContext is only available on server side
    // We need to check if it's available before using it
    // router change --> client side --> ssrContext is undefined
    // direct access or refresh page --> server side --> ssrContext is available
    const userId = user._id

    // Warms the same cache entry the component reads. refresh() reuses
    // still-fresh data, so navigating back here does not refetch.
    const queryCache = useQueryCache(store)
    const entry = queryCache.ensure(setlistQuery(route.params.id))
    const state = await queryCache.refresh(entry).catch(() => null)

    // Check if setlist exists and user is the submitter
    if (!state?.data || state.data.submitter._id !== userId) {
      redirect({ name: 'index' })
      return
    }
  },
})
</script>

<route lang="yaml">
name: setlist-form-edit
meta:
  login: true
</route>
