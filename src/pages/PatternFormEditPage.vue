<template lang="pug">
q-page#patternForm
  q-no-ssr
    //- Header
    q-parallax.header-parallax(:height="200")
      //- Header image background
      template(#media)
        img(src="/assets/header-pattern.png")
      //- Header content
      template(#content)
        .column.items-center
          .text-h4.text-center {{ $t('patternFormPage.titleEdit') }}
    PatternForm
</template>

<script setup>
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import validator from 'validator'
import { useUserStore } from 'src/stores/user'
import { useTempPatternStore } from 'src/stores/temp-pattern'
import PatternForm from 'src/components/PatternForm.vue'
import { useI18n } from 'vue-i18n'

const user = useUserStore()
const { t } = useI18n()
const route = useRoute()

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
        content: new URL(route.fullPath, process.env.HOST_URL).toString(),
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
        content: new URL(route.fullPath, process.env.HOST_URL).toString(),
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
  async preFetch({ currentRoute, redirect, ssrContext }) {
    const pattern = useTempPatternStore()
    const user = useUserStore()

    // Clear store
    pattern.clearData()

    // New pattern form, no need to prefetch data
    if (!currentRoute.params.id) return

    // Check if ID is valid, redirect to 404 if not
    if (currentRoute.params.id && !validator.isMongoId(currentRoute.params.id)) {
      redirect('/404')
    }

    // Note:
    // ssrContext is only available on server side
    // We need to check if it's available before using it
    // router change --> client side --> ssrContext is undefined
    // direct access or refresh page --> server side --> ssrContext is available
    const userId = ssrContext ? ssrContext.req.session.passport?.user?._id || false : user._id

    // Prefetch pattern data
    await pattern.fetchPattern(currentRoute.params.id)

    // Check if pattern exists and user is the submitter
    if (pattern._id.length === 0 || pattern.submitter._id !== userId) {
      redirect('/404')
    }
  },
})
</script>
