<template lang="pug">
#profile-patterns
  .text-center.text-body1(v-if="patterns.length === 0 && scrollPatternDisable") {{ $t('patterns.notFound') }}
  q-infinite-scroll.row.q-my-md(@load="loadPatternScroll" :offset="200" :disable="scrollPatternDisable")
    .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(pattern, index) in patterns" :key="pattern.id")
      PatternCard(:pattern="pattern" :mine="mine")
    template(#loading)
      q-spinner-dots(color="tech" size="40px")
</template>

<script>
import PatternCard from '../../components/PatternCard'

export default {
  data () {
    return {
      patterns: [],
      scrollPatternDisable: false
    }
  },
  components: {
    PatternCard
  },
  computed: {
    mine () {
      return this.$route.params._id === this.user._id
    }
  },
  methods: {
    async fetchPatterns (start = 0) {
      console.log('fetchPatterns')
      try {
        const result = await this.$api.get(
          `/patterns?submitter=${this.$route.params.id}&start=${start}&sort=-1&sortBy=submitDate&limit=12`
        )
        if (result.data.success) {
          if (result.data.result.length > 0) this.patterns = this.patterns.concat(result.data.result)
          else this.scrollPatternDisable = true
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
        this.scrollPatternDisable = true
      }
    },
    async loadPatternScroll (index, done) {
      console.log('loadPatternScroll')
      await this.fetchPatterns((index - 1) * 12)
      done()
    }
  }
}
</script>
