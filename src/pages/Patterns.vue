<template lang="pug">
  q-page#patterns
    section.q-mx-auto.padding
      .container
        .row
          .col-12.q-mx-auto
            h4.text-center {{ $t('nav.patterns') }}
            q-separator.q-my-md
            br
            q-input(rounded outlined v-model="searchForm.keywords" :placeholder="$t('patterns.search')" @keydown.enter="applySearch")
              template(v-slot:after)
                q-btn(icon="search" round desnse flat @click="applySearch")
            br
            q-list.search
              q-item
                q-item-section {{ $t('pattern.keysounded') }}
                q-item-section
                  div
                    q-btn(flat size="10px" :label="$t('patterns.all')" :text-color="searchForm.keysounded === -1 ? 'white' : 'grey'" @click="searchForm.keysounded = -1")
                    q-btn(flat size="10px" :label="$t('patterns.yes')" :text-color="searchForm.keysounded === 1 ? 'white' : 'grey'" @click="searchForm.keysounded = 1")
                    q-btn(flat size="10px" :label="$t('patterns.no')" :text-color="searchForm.keysounded === 0 ? 'white' : 'grey'" @click="searchForm.keysounded = 0")
              q-item
                q-item-section {{ $t('submitForm.control') }}
                q-item-section
                  div
                    q-btn(flat size="10px" :label="$t('patterns.all')" :text-color="searchForm.control === -1 ? 'white' : 'grey'" @click="searchForm.control = -1")
                    q-btn(flat size="10px" :label="$t('pattern.touch')" :text-color="searchForm.control === 0 ? 'white' : 'grey'" @click="searchForm.control = 0")
                    q-btn(flat size="10px" :label="$t('pattern.keys')" :text-color="searchForm.control === 1 ? 'white' : 'grey'" @click="searchForm.control = 1")
                    q-btn(flat size="10px" :label="$t('pattern.km')" :text-color="searchForm.control === 2 ? 'white' : 'grey'" @click="searchForm.control = 2")
            q-separator.q-my-md
            q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
              .col-12.col-md-6.col-lg-3.q-pa-md.q-my-xs(v-for="(pattern, index) in patterns" :key="pattern.id")
                PatternCard(:pattern="pattern" :mine="false")
              template(v-slot:loading)
                q-spinner-dots(color="tech" size="40px")
</template>

<script>
import PatternCard from '../components/PatternCard'

export default {
  name: 'PagePatterns',
  meta () {
    return {
      title: 'Patterns | TECHMANIA',
      meta: {
        title: {
          name: 'title',
          content: 'Patterns | TECHMANIA'
        },
        description: {
          name: 'description',
          content: 'Patterns for TECHMANIA.'
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
          content: 'Patterns | TECHMANIA'
        },
        ogDescription: {
          name: 'og:description',
          content: 'Patterns for TECHMANIA.'
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
          content: 'Patterns | TECHMANIA'
        },
        twDescription: {
          name: 'twitter:description',
          content: 'Patterns for TECHMANIA.'
        },
        twImage: {
          name: 'twitter:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
        }
      }
    }
  },
  components: {
    PatternCard
  },
  data () {
    return {
      patterns: [],
      filter: '',
      error: false,
      submitModel: false,
      searchForm: {
        keywords: '',
        keysounded: -1,
        control: -1
      },
      search: {
        keywords: '',
        keysounded: -1,
        control: -1
      },
      scrollDisable: false
    }
  },
  methods: {
    async fetchPatterns () {
      try {
        let keysounded = 'all'
        if (this.search.keysounded === 0) keysounded = 'no'
        else if (this.search.keysounded === 1) keysounded = 'yes'
        const control = this.search.control > -1 ? this.search.control : ''
        const result = await this.$axios.get(
          new URL(`/api/patterns?start=${this.patterns.length}&keysounded=${keysounded}&control=${control}&keywords=${this.search.keywords}&limit=12`, process.env.HOST_URL)
        )
        if (result.data.success) {
          if (result.data.result.length > 0) this.patterns = this.patterns.concat(result.data.result)
          else this.scrollDisable = true
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
      }
    },
    async loadScroll (index, done) {
      await this.fetchPatterns()
      done()
    },
    applySearch () {
      this.patterns = []
      this.search.keywords = this.searchForm.keywords
      this.search.keysounded = this.searchForm.keysounded
      this.search.control = this.searchForm.control
      this.scrollDisable = false
      this.fetchPatterns()
    }
  }
}
</script>
