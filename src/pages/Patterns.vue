<template lang="pug">
  q-page#patterns
    section.q-mx-auto.padding
      .container
        .row
          .col-12.q-mx-auto
            h4.text-center Patterns
            q-separator.q-my-md
            br
            q-input(rounded outlined v-model="search.text" placeholder="Search song or composer" @keydown.enter="applySearch")
              template(v-slot:after)
                q-btn(icon="search" round desnse flat @click="applySearch")
            br
            q-list.search
              q-item.q-py-none
                q-item-section Keysounded
                q-item-section
                  div
                    q-btn(flat  size="10px" label="All" :text-color="search.keysounded === -1 ? 'white' : 'grey'" @click="search.keysounded = -1")
                    q-btn(flat  size="10px" label="Yes" :text-color="search.keysounded === 1 ? 'white' : 'grey'" @click="search.keysounded = 1")
                    q-btn(flat  size="10px" label="No" :text-color="search.keysounded === 0 ? 'white' : 'grey'" @click="search.keysounded = 0")
            q-separator.q-my-md
        .row.justify-around
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
      filter: '',
      error: false,
      submitModel: false,
      search: {
        text: '',
        keysounded: -1
      }
    }
  },
  computed: {
    filteredPatterns () {
      return this.patterns.filter(pattern => {
        const ks = parseInt(pattern.keysounded)
        const match = pattern.composer.toUpperCase().includes(this.filter.toUpperCase()) || pattern.name.toUpperCase().includes(this.filter.toUpperCase())
        return this.search.keysounded === -1 ? match : match && ks === this.search.keysounded
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
      this.filter = this.search.text
    }
  },
  mounted () {
    this.fetchPatterns()
  }
}
</script>
