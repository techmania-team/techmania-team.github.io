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
          .text-h4.text-center {{ $t('setlistFormPage.titleNew') }}
    SetlistForm
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import SetlistForm from '@/components/SetlistForm.vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { t } = useI18n()
const route = useRoute()

const title = user.isLogin
  ? 'TECHMANIA | ' + t('setlistFormPage.titleNew')
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
</script>

<route lang="yaml">
name: setlist-form-new
meta:
  login: true
</route>
