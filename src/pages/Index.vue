<template lang="pug">
q-page#index
  q-parallax#header-video
    template(#media)
      video(:src="'./assets/header.mp4'" autoplay loop muted playsinline webkit-playsinline)
    template(#content="scope")
      q-no-ssr.absolute.column.items-center.text-center
        img#logo(:src="'./assets/Logo.png'")
        div(v-if="platform === 'windows'")
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://github.com/macmillan333/techmania/releases/' target='_blank')
              q-icon(left name="fab fa-windows" )
              div {{ $t('index.download') }}
          p
            | {{ $t('index.version') }}: {{ tag.win }}
            br
            | {{ $t('index.release') }} {{ published.win }}
            br
            a(href="#" @click.prevent="platform = 'android'") {{ $t('index.platform', {platform: 'Android'}) }}
            | &emsp;
            a(href="#" @click.prevent="platform = 'ios'") {{ $t('index.platform', {platform: 'iOS'}) }}
            | &emsp;
            a(href="#" @click.prevent="platform = 'mac'") {{ $t('index.platform', {platform: 'mac'}) }}
        div(v-else-if="platform === 'android'")
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://github.com/rogeraabbccdd/techmania/releases/' target='_blank')
              q-icon(left name="android" )
              div {{ $t('index.download') }}
          p
            | {{ $t('index.version') }}: {{ tag.android }}
            br
            | {{ $t('index.release') }} {{ published.android }}
            br
            a(href="#" @click.prevent="platform = 'windows'") {{ $t('index.platform', {platform: 'Windows'}) }}
            | &emsp;
            a(href="#" @click.prevent="platform = 'ios'") {{ $t('index.platform', {platform: 'iOS'}) }}
            | &emsp;
            a(href="#" @click.prevent="platform = 'mac'") {{ $t('index.platform', {platform: 'mac'}) }}
        div(v-else-if="platform === 'ios'")
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://apps.apple.com/app/id1581524513' target='_blank')
              q-icon(left name="img:./assets/icons/ios.svg" )
              div {{ $t('index.download') }}
          p
            | {{ $t('index.version') }}: {{ tag.ios }}
            br
            | {{ $t('index.release') }} {{ published.ios }}
            br
            a(href="#" @click.prevent="platform = 'windows'") {{ $t('index.platform', {platform: 'Windows'}) }}
            | &emsp;
            a(href="#" @click.prevent="platform = 'android'") {{ $t('index.platform', {platform: 'Android'}) }}
            | &emsp;
            a(href="#" @click.prevent="platform = 'mac'") {{ $t('index.platform', {platform: 'mac'}) }}
        div(v-else-if="platform === 'mac'")
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://github.com/fhalfkg/techmania/releases/' target='_blank')
              q-icon(left name="fab fa-apple" )
              div {{ $t('index.download') }}
          p
            | {{ $t('index.version') }}: {{ tag.mac }}
            br
            | {{ $t('index.release') }} {{ published.mac }}
            br
            a(href="#" @click.prevent="platform = 'windows'") {{ $t('index.platform', {platform: 'Windows'}) }}
            | &emsp;
            a(href="#" @click.prevent="platform = 'android'") {{ $t('index.platform', {platform: 'Android'}) }}
            | &emsp;
            a(href="#" @click.prevent="platform = 'ios'") {{ $t('index.platform', {platform: 'iOS'}) }}
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('index.patterns') }}
          q-separator
          .row
            .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(pattern, index) in patterns" :key="pattern._id")
              PatternCard(:pattern="pattern" :mine="false")
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('index.skins') }}
          q-separator
          .row
            .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(skin, index) in skins" :key="skin._id")
              SkinCard(:skin="skin" :mine="false")
  section.q-mx-auto.padding.q-my-md
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('index.videos') }}
          q-separator
          .row
            .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(video, idx) in videos" :key="idx")
              q-video(:ratio="16/9" :src="video")
</template>

<script>
import PatternCard from '../components/PatternCard.vue'
import SkinCard from '../components/SkinCard.vue'

export default {
  name: 'PageIndex',
  components: {
    PatternCard,
    SkinCard
  },
  meta () {
    return {
      title: 'TECHMANIA',
      meta: {
        title: {
          name: 'title',
          content: 'TECHMANIA'
        },
        description: {
          name: 'description',
          content: 'Official TECHMANIA Website'
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
          content: 'TECHMANIA'
        },
        ogDescription: {
          property: 'og:description',
          content: 'Official TECHMANIA Website'
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
          content: 'TECHMANIA'
        },
        twDescription: {
          name: 'twitter:description',
          content: 'Official TECHMANIA Website'
        },
        twImage: {
          name: 'twitter:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
        }
      }
    }
  },
  data () {
    return {
      platform: 'windows'
    }
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {
    return store.dispatch('tempIndex/fetchData')
  },
  created () {
    if (process.env.CLIENT) {
      this.$store.dispatch('tempIndex/fetchGitHub')
    }
  },
  computed: {
    tag () {
      return this.$store.getters['tempIndex/getTag']
    },
    patterns () {
      return this.$store.getters['tempIndex/getPatterns']
    },
    skins () {
      return this.$store.getters['tempIndex/getSkins']
    },
    videos () {
      return this.$store.getters['tempIndex/getVideos']
    },
    publishDate () {
      return this.$store.getters['tempIndex/getPublishDate']
    },
    published () {
      return {
        win: this.publishDate.win.length > 0 ? new Date(this.publishDate.win).toLocaleString(this.user.locale) : 'Unknown',
        android: this.publishDate.android.length > 0 ? new Date(this.publishDate.android).toLocaleString(this.user.locale) : 'Unknown',
        ios: this.publishDate.ios.length > 0 ? new Date(this.publishDate.ios).toLocaleString(this.user.locale) : 'Unknown',
        mac: this.publishDate.mac.length > 0 ? new Date(this.publishDate.mac).toLocaleString(this.user.locale) : 'Unknown'
      }
    }
  },
  mounted () {
    if (this.$q.platform.is.android) this.platform = 'android'
    else if (this.$q.platform.is.ios) this.platform = 'ios'
    else if (this.$q.platform.is.mac) this.platform = 'mac'
  }
}
</script>
