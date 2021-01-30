<template lang="pug">
  q-page#changelog
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center Changelog
          q-separator.q-my-md
          div(v-if="releases.length === 0 && !error")
            q-item(v-for="i in 3" :key="i")
              q-item-section(avatar)
                q-skeleton(type='QAvatar')
              q-item-section
                q-item-label
                  q-skeleton(type='text')
                q-item-label(caption)
                  q-skeleton(type='text' width='65%')
          div(v-if="error")
            h6.text-center Failed to fetch data from GitHub.
          q-timeline(color="tech" v-else transition-show="fade")
            q-timeline-entry(
              v-for="release in releases"
              :key="release.node_id"
              :subtitle="new Date(release.published_at).toLocaleString()"
            )
              template(v-slot:title)
                h4.q.q-timeline__title
                  | {{ release.name.length === 0 ? release.tag_name : release.name }}
                  | &nbsp;
                  q-btn.q-mr-xs(flat round icon="fab fa-github" color="tech" @click="openLink(release.html_url)")
                  q-btn.q-mr-xs(flat round icon="download" color="tech" @click="openLink(release.assets[0].browser_download_url)")
                  img(:src="'https://img.shields.io/github/downloads/techmania-team/techmania/' + release.tag_name +'/total'")
              q-separator
              q-btn.full-width(flat align="between" @click="release.expand = !release.expand" :label="release.expand ? 'Hide Detail' : 'Show Detail'" :icon-right="release.expand ? 'expand_less' : 'expand_more'")
              q-slide-transition
                div(v-if="release.expand")
                  q-markdown.q-pa-md(:src="release.body")
</template>

<script>
export default {
  name: 'PageChangelog',
  data () {
    return {
      releases: [],
      error: false
    }
  },
  mounted () {
    this.$axios.get('https://api.github.com/repos/techmania-team/techmania/releases')
      .then(result => {
        this.releases = result.data.map(data => {
          data.expand = false
          return data
        })
      })
      .catch(() => {
        this.error = true
      })
  }
}
</script>
