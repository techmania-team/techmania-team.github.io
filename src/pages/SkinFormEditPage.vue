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
          .text-h4.text-center {{ $t('skinFormPage.titleEdit') }}
    SkinForm
</template>

<script setup>
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import SkinForm from 'src/components/SkinForm.vue'

const route = useRoute()

const metaData = () => {
  return {
    title: 'Log in or sign up to view',
    meta: {
      color: {
        name: 'theme-color',
        content: '#E74C3C',
      },
      title: {
        name: 'title',
        content: 'Log in or sign up to view',
        'data-dynamic': true,
      },
      description: {
        name: 'description',
        content: 'Log in or sign up to view',
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
        content: 'Log in or sign up to view',
        'data-dynamic': true,
      },
      ogDescription: {
        property: 'og:description',
        content: 'Log in or sign up to view',
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
        content: 'Log in or sign up to view',
        'data-dynamic': true,
      },
      twDescription: {
        name: 'twitter:description',
        content: 'Log in or sign up to view',
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
