<template lang="pug">
  .container
    .row
      .col-12.q-mx-auto
        h4.text-center Videos
        q-separator
        .row
          .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(video, idx) in videos" :key="idx")
            q-video(:ratio="16/9" :src="video")
</template>

<script>
export default {
  name: 'IndexVideos',
  data () {
    return {
      videos: []
    }
  },
  methods: {
    async fetchVideos () {
      try {
        const result = await this.$axios.get(process.env.BACK_URL + '?action=indexvideos')
        if (result.data.success) {
          this.videos = ['qQAmkMlBvtg', ...result.data.results].map(video => {
            return 'https://www.youtube.com/embed/' + video
          })
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
      }
    }
  },
  mounted () {
    this.fetchVideos()
  }
}
</script>
