<template lang="pug">
  .container
    .row
      .col-12.q-mx-auto
        h4.text-center Videos
        q-separator
        .row
          .col-12.col-md-6.col-lg-3.q-pa-md.q-my-lg(v-for="(video, idx) in videos" :key="idx")
            q-video(:ratio="16/9" :src="video")
</template>

<script>
export default {
  name: 'IndexVideos',
  data () {
    return {
      videos: [
        'https://www.youtube.com/embed/qQAmkMlBvtg',
        'https://www.youtube.com/embed/HJm2royZpR0',
        'https://www.youtube.com/embed/bJwrmy8UmGM',
        'https://www.youtube.com/embed/tdDm6Mrir7I'
      ]
    }
  }
}
</script>
