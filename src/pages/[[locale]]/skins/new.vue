<template lang="pug">
q-page#skinForm
  q-no-ssr
    //- Header
    q-parallax.header-parallax(:height="200")
      //- Header image background
      template(#media)
        img(src="/assets/header-skin.png")
      //- Header content
      template(#content)
        .column.items-center
          .text-h4.text-center {{ $t('skinFormPage.titleNew') }}
    SkinForm
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import SkinForm from '@/components/SkinForm.vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { t } = useI18n()
const route = useRoute()

const title = computed(() =>
  user.isLogin
    ? t('skinFormPage.meta.title', { text: t('skinFormPage.titleNew') })
    : t('skinFormPage.meta.title', { text: t('skinFormPage.meta.login') }),
)

const description = computed(() =>
  user.isLogin
    ? t('skinFormPage.meta.description', { text: t('skinFormPage.titleNew') })
    : t('skinFormPage.meta.description', { text: t('skinFormPage.meta.login') }),
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
</script>

<route lang="yaml">
name: skin-form-new
meta:
  login: true
</route>
