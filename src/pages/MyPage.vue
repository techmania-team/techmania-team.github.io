<template lang="pug">
  q-page#my-page
    section.q-mx-auto.padding
      .container
        .row
          .col-12.q-mx-auto
            h4.text-center My Patterns
            q-separator.q-my-md
            br
            q-input(rounded outlined v-model="search" placeholder="Search" @keydown.enter="applySearch")
              template(v-slot:after)
                q-btn(icon="search" round desnse flat @click="applySearch")
        .row
          .col-12.col-sm-6.col-lg-3.q-pa-md.q-my-lg(v-for="(pattern, index) in filteredPatterns" :key="pattern.id")
            PatternCard(:pattern="pattern" :mine="true" @edit="editPattern(pattern.id)")
    PatternDialog(:open="isModalOpen" :patterndata="editingPattern" @model="val => isModalOpen = val" @refreshPattern="fetchMyPattern")
    q-page-sticky(position="bottom-right" :offset="[36, 36]")
      q-btn(fab icon="add" color="tech" text-color="black" @click="newPattern")
</template>

<script>
import PatternDialog from '../components/PatternDialog'
import PatternCard from '../components/PatternCard'

export default {
  name: 'PageMyPage',
  meta () {
    return {
      title: 'My Page | TECHMANIA',
      meta: {
        title: {
          name: 'title',
          content: 'My Page | TECHMANIA'
        },
        description: {
          name: 'description',
          content: 'Your profile'
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
          content: 'My Page | TECHMANIA'
        },
        ogDescription: {
          name: 'og:description',
          content: 'Your profile'
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
          content: 'My Page | TECHMANIA'
        },
        twDescription: {
          name: 'twitter:description',
          content: 'Your profile'
        },
        twImage: {
          name: 'twitter:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
        }
      }
    }
  },
  components: {
    PatternDialog,
    PatternCard
  },
  data () {
    return {
      isModalOpen: false,
      patterns: [],
      search: '',
      filter: '',
      error: false,
      editingPattern: {}
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
    async fetchMyPattern () {
      try {
        const result = await this.$axios.get(new URL(`/api/patterns?submitter=${this.user.id}`, process.env.HOST_URL))
        if (result.data.success) {
          this.patterns = result.data.result
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
      }
    },
    editPattern (id) {
      this.editingPattern = this.patterns.find(pattern => pattern.id === id)
      this.isModalOpen = true
    },
    newPattern () {
      this.editingPattern = {}
      this.isModalOpen = true
    },
    applySearch () {
      this.filter = this.search
    }
  },
  mounted () {
    this.fetchMyPattern()
  }
}
</script>
