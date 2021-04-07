<template lang="pug">
  .fullscreen.bg-blue.text-white.text-center.q-pa-md.flex.flex-center
    div
      div(style='font-size: 30vh') 404
      .text-h2(style='opacity:.4') Oops. Nothing here...
    q-btn.q-mt-xl(color='white' text-color='blue' unelevated to='/' label='Go Home' no-caps)
</template>

<script>
export default {
  name: 'Error404',
  meta () {
    return {
      title: '404 | TECHMANIA',
      meta: {
        title: {
          name: 'title',
          content: '404 | TECHMANIA'
        },
        description: {
          name: 'description',
          content: 'Oops. Nothing here...'
        },
        ogType: {
          name: 'og:type',
          content: 'website'
        },
        ogUrl: {
          name: 'og:url',
          content: new URL(process.env.HOST_URL + this.$route.fullPath)
        },
        ogTitle: {
          name: 'og:title',
          content: '404 | TECHMANIA'
        },
        ogDescription: {
          name: 'og:description',
          content: 'Oops. Nothing here...'
        },
        ogImage: {
          name: 'og:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
        },
        twCard: {
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        twUrl: {
          name: 'twitter:url',
          content: new URL(process.env.HOST_URL + this.$route.fullPath)
        },
        twTitle: {
          name: 'twitter:title',
          content: '404 | TECHMANIA'
        },
        twDescription: {
          name: 'twitter:description',
          content: 'Oops. Nothing here...'
        },
        twImage: {
          name: 'twitter:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
        }
      }
    }
  }
}
</script>
