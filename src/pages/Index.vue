<template lang="pug">
  q-page#index
    q-parallax#header-video
      template(v-slot:media)
        video(:src="'./assets/header.webm'" autoplay loop muted)
      template(v-slot:content="scope")
        img.full-width(:src="'./assets/Logo.png'")
        q-btn.q-my-md(color="secondary" size="lg" @click="openLink('https://github.com/macmillan333/techmania/releases/latest')")
          q-icon(left name="download" )
          div Download
        div.text-center
          | Latest Version: {{ tag }}
          br
          | Released at {{ published }}
    section.q-mx-auto.padding
      Patterns#index-videos
    section.q-mx-auto.padding
      Videos#index-videos
</template>

<script>
import Videos from '../components/IndexVideos.vue'
import Patterns from '../components/IndexPatterns.vue'

export default {
  name: 'PageIndex',
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
