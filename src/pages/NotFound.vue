<template lang="pug">
.fullscreen.bg-blue.text-white.text-center.q-pa-md.flex.flex-center
  div
    div(style='font-size: 30vh') 404
    .text-h2(style='opacity:.4') Oops. Nothing here...
  q-btn.q-mt-xl(color='white' text-color='blue' unelevated to='/' label='Go Home' no-caps)
</template>

<script>
export default {
  meta () {
    return {
      title: 'TECHMANIA | 404',
      meta: {
        color: {
          name: 'theme-color',
          content: '#E74C3C'
        },
        title: {
          name: 'title',
          content: 'TECHMANIA | 404'
        },
        description: {
          name: 'description',
          content: 'Oops. Nothing here...'
        },
        ogType: {
          property: 'og:type',
          content: 'website'
        },
        ogUrl: {
          property: 'og:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString()
        },
        ogTitle: {
          property: 'og:title',
          content: 'TECHMANIA | 404'
        },
        ogDescription: {
          property: 'og:description',
          content: 'Oops. Nothing here...'
        },
        ogImage: {
          property: 'og:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
        },
        twCard: {
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        twUrl: {
          name: 'twitter:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString()
        },
        twTitle: {
          name: 'twitter:title',
          content: 'TECHMANIA | 404'
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
