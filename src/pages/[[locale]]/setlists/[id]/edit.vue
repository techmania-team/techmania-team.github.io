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
import { useMeta } from 'quasar'
import validator from 'validator'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import SetlistForm from '@/components/SetlistForm.vue'
import { useTempSetlistStore } from '@/stores/temp-setlist'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { t } = useI18n()
const route = useRoute()
const setlist = useTempSetlistStore()

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

const metaData = () => {
  return {
    title: title.value,
    meta: {
      color: {
        name: 'theme-color',
        content: '#E74C3C',
      },
      title: {
        name: 'title',
        content: title.value,
        'data-dynamic': true,
      },
      description: {
        name: 'description',
        content: description.value,
        'data-dynamic': true,
      },
      ogType: {
        property: 'og:type',
        content: 'website',
      },
      ogUrl: {
        property: 'og:url',
        content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
        'data-dynamic': true,
      },
      ogTitle: {
        property: 'og:title',
        content: title.value,
        'data-dynamic': true,
      },
      ogDescription: {
        property: 'og:description',
        content: description.value,
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
        'data-dynamic': true,
      },
      twTitle: {
        name: 'twitter:title',
        content: title.value,
        'data-dynamic': true,
      },
      twDescription: {
        name: 'twitter:description',
        content: description.value,
        'data-dynamic': true,
      },
      twImage: {
        name: 'twitter:image',
        content:
          'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
      },
    },
  }
}
useMeta(metaData)

defineOptions({
  async preFetch({ currentRoute, redirect, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<
      RouteNamedMap,
      'setlist-form-edit'
    >

    const setlist = useTempSetlistStore(store)
    const user = useUserStore(store)

    // Clear store
    setlist.clearData()

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

    // Prefetch setlist data
    await setlist.fetchSetlist(route.params.id)

    // Check if setlist exists and user is the submitter
    if (setlist._id.length === 0 || setlist.submitter._id !== userId) {
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
