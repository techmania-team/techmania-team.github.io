<template lang="pug">
q-page#patternForm
  //- Header
  q-parallax.header-parallax(:height="200")
    //- Header image background
    template(#media)
      img(src="/assets/header-pattern.png")
    //- Header content
    template(#content)
      .column.items-center
        .text-h4.text-center {{ $t('patternFormPage.titleEdit') }}
  PatternForm(:pattern="pattern")
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoadedTyped } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'
import { useMeta } from 'quasar'
import validator from 'validator'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import PatternForm from '@/components/PatternForm.vue'
import { useTempPatternStore } from '@/stores/temp-pattern'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { t } = useI18n()
const route = useRoute()
const pattern = useTempPatternStore()

const title = user.isLogin
  ? 'TECHMANIA | ' + t('patternFormPage.titleEdit')
  : 'TECHMANIA | Log in or sign up to view'

const metaData = () => {
  return {
    title,
    meta: {
      color: {
        name: 'theme-color',
        content: '#E74C3C',
      },
      title: {
        name: 'title',
        content: title,
        'data-dynamic': true,
      },
      description: {
        name: 'description',
        content: title,
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
        content: title,
        'data-dynamic': true,
      },
      ogDescription: {
        property: 'og:description',
        content: title,
        'data-dynamic': true,
      },
      ogImage: {
        property: 'og:image',
        content:
          'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
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
        content: title,
        'data-dynamic': true,
      },
      twDescription: {
        name: 'twitter:description',
        content: title,
        'data-dynamic': true,
      },
      twImage: {
        name: 'twitter:image',
        content:
          'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
        'data-dynamic': true,
      },
    },
  }
}
useMeta(metaData)

defineOptions({
  async preFetch({ currentRoute, redirect, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<
      RouteNamedMap,
      'pattern-form-edit'
    >
    const pattern = useTempPatternStore(store)
    const user = useUserStore(store)

    // Clear store
    pattern.clearData()

    // New pattern form, no need to prefetch data
    if (!route.params.id) return

    // Check if ID is valid, redirect to 404 if not
    if (route.params.id && !validator.isMongoId(route.params.id)) {
      redirect('/404')
      return
    }

    // Note:
    // ssrContext is only available on server side
    // We need to check if it's available before using it
    // router change --> client side --> ssrContext is undefined
    // direct access or refresh page --> server side --> ssrContext is available
    const userId = user._id

    // Prefetch pattern data
    await pattern.fetchPattern(route.params.id)

    // Check if pattern exists and user is the submitter
    if (pattern._id.length === 0 || pattern.submitter._id !== userId) {
      redirect('/404')
      return
    }
  },
})
</script>

<route lang="yaml">
name: pattern-form-edit
meta:
  login: true
</route>
