<template lang="pug">
  .container
    .row
      .col-12.q-mx-auto
        h4.text-center Latest Patterns
        q-separator
        .row
          .col-12.col-sm-6.col-md-3.q-pa-md.q-my-lg(v-for="(pattern, index) in patterns" :key="pattern.id")
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
        const result = await this.$axios.get(process.env.BACK_URL + '?action=indexpatterns')
        if (result.data.success) {
          this.patterns = result.data.results
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
