<template lang="pug">
  q-page#index
    q-parallax#header-video
      template(v-slot:media)
        video(:src="'./assets/header.mp4'" autoplay loop muted playsinline webkit-playsinline)
      template(v-slot:content="scope")
        .absolute.column.items-center.text-center
          img#logo(:src="'./assets/Logo.png'")
          div(v-if="platform === 'windows'")
            .text-h3
              q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://github.com/macmillan333/techmania/releases/latest')
                q-icon(left name="fab fa-windows" )
                div {{ $t('index.download') }}
            p
              | {{ $t('index.version') }}: {{ tag }}
              br
              | {{ $t('index.release') }} {{ published }}
              br
              a(href="#" @click.prevent="platform = 'android'") {{ $t('index.platform', {platform: 'Android'}) }}
          div(v-else-if="platform === 'android'")
            .text-h3
              q-btn.q-my-md(color="secondary" size="lg" type='a' href='https://drive.google.com/file/d/11jgs4E46cm6swlt6CN4j7kkwjljSiDdj/view')
                q-icon(left name="android" )
                div {{ $t('index.download') }}
            p
              | {{ $t('index.version') }}: {{ tagAndroid }}
              br
              | {{ $t('index.release') }} {{ publishAndroid }}
              br
              a(href="#" @click.prevent="platform = 'windows'") {{ $t('index.platform', {platform: 'Windows'}) }}
    section.q-mx-auto.padding.q-my-md
      Patterns#index-patterns
    section.q-mx-auto.padding.q-my-md
      Videos#index-videos
</template>

<script>
import Videos from '../components/IndexVideos.vue'
import Patterns from '../components/IndexPatterns.vue'

export default {
  name: 'PageIndex',
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
          name: 'og:type',
          content: 'website'
        },
        ogUrl: {
          name: 'og:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString()
        },
        ogTitle: {
          name: 'og:title',
          content: 'TECHMANIA'
        },
        ogDescription: {
          name: 'og:description',
          content: 'Official TECHMANIA Website'
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
  components: {
    Videos,
    Patterns
  },
  data () {
    return {
      tag: '',
      tagAndroid: '0.7',
      publishDate: '',
      publishAndroid: '',
      platform: 'windows'
    }
  },
  computed: {
    published () {
      return this.publishDate.length > 0 ? new Date(this.publishDate).toLocaleString(this.user.locale) : 'Unknown'
    }
  },
  methods: {
    async getLatestTag () {
      try {
        const result = await this.$axios.get('https://api.github.com/repos/techmania-team/techmania/releases')
        this.tag = result.data[0].tag_name
        this.publishDate = result.data[0].published_at
      } catch (_) {
        this.tag = 'Unknown'
      }
    }
  },
  mounted () {
    this.getLatestTag()
    this.publishAndroid = new Date('2021/06/14 14:33:00 GMT+0800').toLocaleString(this.user.locale)
    if (this.$q.platform.is.android) this.platform = 'android'
  }
}
</script>
