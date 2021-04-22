<template lang="pug">
  q-page#index
    q-parallax#header-video
      template(v-slot:media)
        video(:src="'./assets/header.webm'" autoplay loop muted)
      template(v-slot:content="scope")
        .absolute.column.items-center
          img#logo(:src="'./assets/Logo.png'")
          .text-h3
            q-btn.q-my-md(color="secondary" size="lg" @click="openLink('https://github.com/macmillan333/techmania/releases/latest')")
              q-icon(left name="download" )
              div {{ $t('index.download') }}
          .text-center
            | {{ $t('index.version') }}: {{ tag }}
            br
            | {{ $t('index.release') }} {{ published }}
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
      published: ''
    }
  },
  methods: {
    async getLatestTag () {
      try {
        const result = await this.$axios.get('https://api.github.com/repos/techmania-team/techmania/releases')
        this.tag = result.data[0].tag_name
        this.published = new Date(result.data[0].published_at).toLocaleString()
      } catch (_) {
        this.tag = 'Unknown'
        this.published = 'Unknown'
      }
    }
  },
  mounted () {
    this.getLatestTag()
  }
}
</script>
