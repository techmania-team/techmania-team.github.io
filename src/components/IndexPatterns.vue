<template lang="pug">
  .container
    .row
      .col-12.q-mx-auto
        h4.text-center Latest Patterns
        q-separator
        .row
          .col-12.col-sm-6.col-md-3.q-pa-md.q-my-xs(v-for="(pattern, index) in patterns" :key="pattern._id")
            PatternCard(:pattern="pattern" :mine="false")
</template>

<script>
import PatternCard from './PatternCard'

export default {
  name: 'IndexPatterns',
  components: {
    PatternCard
  },
  data () {
    return {
      patterns: []
    }
  },
  methods: {
    async fetchPatterns () {
      try {
        const result = await this.$axios.get(new URL('/api/patterns?start=0&limit=8', process.env.HOST_URL))
        if (result.data.success) {
          this.patterns = result.data.result
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
      }
    }
  },
  mounted () {
    this.fetchPatterns()
  }
}
</script>
