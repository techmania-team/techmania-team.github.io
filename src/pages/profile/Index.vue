<template lang="pug">
q-page#profile
  section.q-mx-auto.padding
    .container
      .row
        .col-6.q-mx-auto.text-center
          h4.q-mb-md
            q-avatar(rounded size="100px")
              img(:src="profile.avatar")
          h4.q-my-md {{ profile.name }}
      q-separator.q-mt-md
      .row
        .col-12
          q-tabs(align="justify")
            q-route-tab(:to="'/users/' + $route.params.id + '/patterns'" :label="$t('nav.patterns')" icon="music_note")
              q-badge(color="tech" text-color="black" floating) {{ profile.patternCount }}
            q-route-tab(:to="'/users/' + $route.params.id + '/skins'" :label="$t('nav.skins')" icon="stars")
              q-badge(color="tech" text-color="black" floating) {{ profile.skinCount }}
            q-route-tab(:to="'/users/' + $route.params.id + '/comments'" :label="$t('comment.comments')" icon="comment")
              q-badge(color="tech" text-color="black" floating) {{ profile.replyCount }}
        .col-12
          router-view
</template>

<script>
export default {
  name: 'profile',
  meta () {
    return {
      title: `TECHMANIA | ${this.profile.name}`,
      meta: {
        color: {
          name: 'theme-color',
          content: '#E74C3C'
        },
        title: {
          name: 'title',
          content: `${this.profile.name}`,
          'data-dynamic': true
        },
        description: {
          name: 'description',
          content: `${this.profile.name}'s profile on TECHMANIA.`,
          'data-dynamic': true
        },
        ogType: {
          property: 'og:type',
          content: 'website',
          'data-dynamic': true
        },
        ogUrl: {
          property: 'og:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString(),
          'data-dynamic': true
        },
        ogTitle: {
          property: 'og:title',
          content: `TECHMANIA | ${this.profile.name}`,
          'data-dynamic': true
        },
        ogDescription: {
          property: 'og:description',
          content: `${this.profile.name}'s profile on TECHMANIA.`,
          'data-dynamic': true
        },
        ogImage: {
          property: 'og:image',
          content: this.profile.avatar,
          'data-dynamic': true
        },
        twCard: {
          name: 'twitter:card',
          content: 'summary_large_image',
          'data-dynamic': true
        },
        twUrl: {
          name: 'twitter:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString(),
          'data-dynamic': true
        },
        twTitle: {
          name: 'twitter:title',
          content: `TECHMANIA | ${this.profile.name}`,
          'data-dynamic': true
        },
        twDescription: {
          name: 'twitter:description',
          content: `${this.profile.name}'s profile on TECHMANIA.`,
          'data-dynamic': true
        },
        twImage: {
          name: 'twitter:image',
          content: this.profile.avatar,
          'data-dynamic': true
        }
      }
    }
  },
  data () {
    return {
      profile: {
        name: '',
        avatar: '',
        patternCount: 0,
        skinCount: 0,
        replyCount: 0,
        _id: ''
      },
      tab: 'patterns'
    }
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {
    store.commit('tempProfile/resetProfile')
    return store.dispatch('tempProfile/fetchProfile', currentRoute.params.id)
  },
  created () {
    this.profile = this.$store.getters['tempProfile/getProfile']
    if (this.profile._id.length === 0) {
      this.$router.push('/404')
    } else if (process.env.CLIENT) {
      document.title = `TECHMANIA | ${this.profile.name}`
    }
  }
}
</script>
