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

<script setup>
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import validator from 'validator'
import { useTempSetlistStore } from 'src/stores/temp-setlist'
import { useUserStore } from 'src/stores/user'
import SetlistForm from 'src/components/SetlistForm.vue'

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

defineOptions({
  async preFetch({ currentRoute, redirect, ssrContext }) {
    const setlist = useTempSetlistStore()
    const user = useUserStore()

    // Clear store
    setlist.clearData()

    // New setlist form, no need to prefetch data
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

    // Prefetch setlist data
    await setlist.fetchSetlist(currentRoute.params.id)

    // Check if setlist exists and user is the submitter
    if (setlist._id.length === 0 || setlist.submitter._id !== userId) {
      redirect('/404')
    }
  },
})
</script>
