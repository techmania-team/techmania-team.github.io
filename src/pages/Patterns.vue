<template lang="pug">
  q-page#patterns
    section.q-mx-auto.padding
      .container
        .row
          .col-12.q-mx-auto
            h4.text-center Patterns
            q-separator.q-my-md
            br
            q-input(rounded outlined v-model="search" placeholder="Search" @keydown.enter="applySearch")
              template(v-slot:after)
                q-btn(icon="search" round desnse flat @click="applySearch")
        .row
          .col-12.col-sm-6.col-lg-3.q-pa-md.q-my-lg(v-for="(pattern, index) in filteredPatterns" :key="pattern.id")
          .col-12.col-sm-6.col-md-3.q-pa-md.q-my-lg(v-for="(pattern, index) in filteredPatterns" :key="pattern.id")
            PatternCard(:pattern="pattern" :mine="false")
</template>

<script>
import PatternCard from '../components/PatternCard'

export default {
  name: 'PagePatterns',
  components: {
    PatternCard
  },
  data () {
    return {
      patterns: [],
      search: '',
      filter: '',
      error: false,
      submitModel: false
    }
  },
  computed: {
    filteredPatterns () {
      return this.patterns.filter(pattern => {
        return pattern.composer.includes(this.filter) || pattern.name.includes(this.filter)
      })
    }
  },
  methods: {
    openDialog () {
      if (this.isLogin) {
        this.submitModel = true
      } else {
        this.$q.notify({
          icon: 'warning',
          message: 'You must login to submit a new pattern.',
          color: 'negative',
          position: 'top',
          timeout: 2000
        })
      }
    },
    async fetchPatterns () {
      try {
        const result = await this.$axios.get(process.env.BACK_URL + '?action=patterns')
        if (result.data.success) {
          this.patterns = result.data.results
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
      }
    },
    applySearch () {
      this.filter = this.search
    }
  },
  mounted () {
    this.fetchPatterns()
  }
}
</script>
