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
            template(#after)
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
            q-item
              q-item-section {{ $t('submitForm.lanes') }}
              q-item-section
                div
                  q-option-group(inline :options="[{label: '2', value: 2}, {label: '3', value: 3}, {label: '4', value: 4}]" type="checkbox" v-model="searchForm.lanes")
            q-item
              q-item-section {{ $t('patterns.sort') }}
              q-item-section
                div
                  q-btn(flat size="10px" :label="$t('patterns.sortSubmit')" :icon-right="getSortIcon('submitDate')" :text-color="searchForm.sortBy === 'submitDate' ? 'white' : 'grey'" @click="changeSort('submitDate')")
                  q-btn(flat size="10px" :label="$t('patterns.sortUpdate')" :icon-right="getSortIcon('updateDate')" :text-color="searchForm.sortBy === 'updateDate' ? 'white' : 'grey'" @click="changeSort('updateDate')")
                  q-btn(flat size="10px" :label="$t('patterns.sortName')" :icon-right="getSortIcon('name')" :text-color="searchForm.sortBy === 'name' ? 'white' : 'grey'" @click="changeSort('name')")
          q-separator.q-my-md
          q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
            .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(pattern, index) in patterns" :key="pattern.id")
              PatternCard(:pattern="pattern" :mine="false")
            template(#loading)
              q-spinner-dots(color="tech" size="40px")
          .text-center.text-body1(v-if="patterns.length === 0 && scrollDisable") {{ $t('patterns.notFound') }}
  q-no-ssr
    q-page-sticky(position="bottom-right" :offset="[36,36]" v-if="isLogin")
      q-btn(fab icon="add" color="tech" text-color="black" @click="$router.push('/patterns/new')")
</template>

<script>
import PatternCard from '../components/PatternCard'

export default {
  name: 'PagePatterns',
  meta () {
    return {
      title: 'TECHMANIA | Patterns',
      meta: {
        color: {
          name: 'theme-color',
          content: '#E74C3C'
        },
        title: {
          name: 'title',
          content: 'TECHMANIA | Patterns'
        },
        description: {
          name: 'description',
          content: 'Patterns for TECHMANIA.'
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
          content: 'TECHMANIA | Patterns'
        },
        ogDescription: {
          property: 'og:description',
          content: 'Patterns for TECHMANIA.'
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
          content: 'TECHMANIA | Patterns'
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
        control: -1,
        sort: -1,
        lanes: [2, 3, 4],
        sortBy: 'submitDate'
      },
      search: {
        keywords: '',
        keysounded: -1,
        control: -1,
        sort: -1,
        lanes: [2, 3, 4],
        sortBy: 'submitDate'
      },
      scrollDisable: false
    }
  },
  methods: {
    async fetchPatterns (start = 0) {
      try {
        let keysounded = 'all'
        if (this.search.keysounded === 0) keysounded = 'no'
        else if (this.search.keysounded === 1) keysounded = 'yes'
        const control = this.search.control > -1 ? this.search.control : ''
        const result = await this.$api.get(
          `/patterns?start=${start}&keysounded=${keysounded}&control=${control}&keywords=${this.search.keywords}&lanes=${this.search.lanes.join()}&sort=${this.search.sort}&sortBy=${this.search.sortBy}&limit=12`
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
      await this.fetchPatterns((index - 1) * 12)
      done()
    },
    applySearch () {
      this.patterns = []
      this.search.keywords = this.searchForm.keywords
      this.search.keysounded = this.searchForm.keysounded
      this.search.control = this.searchForm.control
      this.search.lanes = this.searchForm.lanes
      this.search.sort = this.searchForm.sort
      this.search.sortBy = this.searchForm.sortBy
      this.scrollDisable = false
      this.fetchPatterns()
    },
    getSortIcon (sortBy) {
      if (this.searchForm.sortBy === sortBy) return this.searchForm.sort > 0 ? 'arrow_drop_up' : 'arrow_drop_down'
      else return undefined
    },
    changeSort (sortBy) {
      if (this.searchForm.sortBy === sortBy) this.searchForm.sort *= -1
      else {
        this.searchForm.sortBy = sortBy
        this.searchForm.sort = -1
      }
    }
  }
}
</script>
