<template lang="pug">
  q-page#pattern
    section.bg(:style="{backgroundImage: `url(${this.backgroundImage})`}")
    section.q-mx-auto.padding
      .container
        .row
          .col-6.q-mx-auto
            h4 {{ pattern.name }}
          .col-6.text-right
            h4
              q-btn.q-mr-xs(flat icon="download" color="tech" @click="openLink(pattern.link)") DOWNLOAD
        q-separator
        .row.q-my-md
          .col-6
            .text-h6.q-mt-md.q-mb-lg Pattern Data
            .q-gutter-sm
              div
                q-icon(name="person")
                | &nbsp;Composed by {{ pattern.composer }}
              div
                q-icon(name="upload")
                | &nbsp;Submitted by {{ pattern.user }}
              div(:class="[{'text-red': !pattern.keysounded, 'text-positive': pattern.keysounded}]")
                q-icon(:name="!pattern.keysounded ? 'close' : 'check'")
                | &nbsp;Keysounded
              div(v-for="(difficulty, index) in pattern.difficulties" :key="'D'+index" :class="getLevelColor(difficulty.level)")
                q-icon(size="sm" :name="getControlIcon(difficulty.control, difficulty.level)" :class="getLevelColor(difficulty.level)")
                | &nbsp;{{ difficulty.name }} Lv.{{ difficulty.level }}
          .col-12.col-md-6.pre-line.q-my-md.q-my-md-none
            .text-h6.q-mt-md.q-mb-lg Description
            p {{ pattern.description }}
        .row.justify-center
          .col-12.text-h6.text-center Previews
          .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(video, idx) in pattern.previews" :key="idx")
            q-video(:ratio="16/9" :src="'https://www.youtube.com/embed/'+video.ytid")
</template>

<script>
export default {
  name: 'PagePatterns',
  meta () {
    return {
      title: `${this.pattern.name} | TECHMANIA`,
      meta: {
        title: {
          name: 'title',
          content: `${this.pattern.name} | TECHMANIA`,
          'data-dynamic': true
        },
        description: {
          name: 'description',
          content: `TECHMANIA >> Patterns >> ${this.pattern.name}`,
          'data-dynamic': true
        },
        ogType: {
          name: 'og:type',
          content: 'website',
          'data-dynamic': true
        },
        ogUrl: {
          name: 'og:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString(),
          'data-dynamic': true
        },
        ogTitle: {
          name: 'og:title',
          content: `${this.pattern.name} | TECHMANIA`,
          'data-dynamic': true
        },
        ogDescription: {
          name: 'og:description',
          content: `TECHMANIA >> Patterns >> ${this.pattern.name}`,
          'data-dynamic': true
        },
        ogImage: {
          name: 'og:image',
          content: this.backgroundImage,
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
          content: `${this.pattern.name} | TECHMANIA`,
          'data-dynamic': true
        },
        twDescription: {
          name: 'twitter:description',
          content: `TECHMANIA >> Patterns >> ${this.pattern.name}`,
          'data-dynamic': true
        },
        twImage: {
          name: 'twitter:image',
          content: this.backgroundImage,
          'data-dynamic': true
        }
      }
    }
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {
    return store.dispatch('temp/fetchPattern', currentRoute.params.id)
  },
  data () {
    return {
      pattern: {
        _id: '',
        name: '',
        composer: '',
        keysounded: '',
        difficulties: [],
        link: '',
        previews: [],
        description: '',
        submitter: { name: '', _id: '' }
      }
    }
  },
  computed: {
    backgroundImage () {
      return this.pattern.previews.length > 0 ? `http://i3.ytimg.com/vi/${this.pattern.previews[0].ytid}/hqdefault.jpg` : ''
    }
  },
  methods: {
    async fetchPattern () {
      try {
        const result = await this.$axios.get(new URL(`/api/patterns/${this.$route.params.id}`, process.env.HOST_URL))
        if (result.data.success) {
          this.pattern = result.data.result
          document.title = `${this.pattern.name} | TECHMANIA`
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.$router.push('/404')
      }
    }
  },
  mounted () {
    this.pattern = this.$store.getters['temp/getPattern']
    document.title = `${this.pattern.name} | TECHMANIA`
    this.$store.commit('temp/cleanPattern')
  }
}
</script>
