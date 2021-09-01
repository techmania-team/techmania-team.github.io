<template lang="pug">
  q-page#profile
    section.q-mx-auto.padding
      .container
        .row
          .col-6.q-mx-auto.text-center
            h4.q-mb-md
              q-avatar(rounded size="100px")
                img(:src="profile.avatar")
            h4.q-my-md {{ profile.name }}
        q-separator.q-mt-md
        .row
          .col-12
            q-tabs(v-model="tab" align="justify")
              q-tab(name="patterns" :label="$t('nav.patterns')" icon="music_note")
                q-badge(color="tech" text-color="black" floating) {{ profile.patternCount }}
              q-tab(name="skins" :label="$t('nav.skins')" icon="stars")
                q-badge(color="tech" text-color="black" floating) {{ profile.skinCount }}
          .col-12
            q-tab-panels(v-model="tab" animated keep-alive)
              q-tab-panel(name="patterns")
                .text-center.text-body1(v-if="patterns.length === 0 && scrollPatternDisable") {{ $t('patterns.notFound') }}
                q-infinite-scroll.row.q-my-md(@load="loadPatternScroll" :offset="200" :disable="scrollPatternDisable")
                  .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(pattern, index) in patterns" :key="pattern.id")
                    PatternCard(:pattern="pattern" :mine="mine")
                  template(#loading)
                    q-spinner-dots(color="tech" size="40px")
              q-tab-panel(name="skins")
                .text-center.text-body1(v-if="skins.length === 0 && scrollSkinDisable") {{ $t('skins.notFound') }}
                q-infinite-scroll.row.q-my-md(@load="loadSkinScroll" :offset="200" :disable="scrollSkinDisable")
                  .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(skin, index) in skins" :key="skin.id")
                    SkinCard(:skin="skin" :mine="mine")
                  template(#loading)
                    q-spinner-dots(color="tech" size="40px")
</template>

<script>
import PatternCard from '../components/PatternCard'
import SkinCard from '../components/SkinCard'

export default {
  name: 'profile',
  meta () {
    return {
      title: `TECHMANIA | ${this.profile.name}`,
      meta: {
        title: {
          name: 'title',
          content: `${this.profile.name}`,
          'data-dynamic': true
        },
        description: {
          name: 'description',
          content: `${this.profile.name}'s profile on TECHMANIA.`,
          'data-dynamic': true
        },
        ogType: {
          property: 'og:type',
          content: 'website',
          'data-dynamic': true
        },
        ogUrl: {
          property: 'og:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString(),
          'data-dynamic': true
        },
        ogTitle: {
          property: 'og:title',
          content: `TECHMANIA | ${this.profile.name}`,
          'data-dynamic': true
        },
        ogDescription: {
          property: 'og:description',
          content: `${this.profile.name}'s profile on TECHMANIA.`,
          'data-dynamic': true
        },
        ogImage: {
          property: 'og:image',
          content: this.profile.avatar,
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
          content: `TECHMANIA | ${this.profile.name}`,
          'data-dynamic': true
        },
        twDescription: {
          name: 'twitter:description',
          content: `${this.profile.name}'s profile on TECHMANIA.`,
          'data-dynamic': true
        },
        twImage: {
          name: 'twitter:image',
          content: this.profile.avatar,
          'data-dynamic': true
        }
      }
    }
  },
  components: {
    PatternCard,
    SkinCard
  },
  data () {
    return {
      profile: {
        name: '',
        avatar: '',
        patternCount: 0,
        skinCount: 0,
        _id: ''
      },
      tab: 'patterns',
      patterns: [],
      scrollPatternDisable: false,
      skins: [],
      scrollSkinDisable: false
    }
  },
  computed: {
    mine () {
      return this.profile._id === this.user.id
    }
  },
  watch: {
    tab (val) {
      location.hash = val
    }
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {
    return store.dispatch('tempProfile/fetchProfile', currentRoute.params.id)
  },
  methods: {
    async fetchPatterns (start = 0) {
      try {
        const result = await this.$axios.get(
          new URL(`/api/patterns?submitter=${this.profile._id}&start=${start}&sort=-1&sortBy=submitDate&limit=12`, process.env.HOST_URL)
        )
        if (result.data.success) {
          if (result.data.result.length > 0) this.patterns = this.patterns.concat(result.data.result)
          else this.scrollPatternDisable = true
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
      }
    },
    async loadPatternScroll (index, done) {
      await this.fetchPatterns((index - 1) * 12)
      done()
    },
    async fetchSkins (start = 0) {
      try {
        const result = await this.$axios.get(
          new URL(`/api/skins?submitter=${this.profile._id}&start=${start}&sort=-1&sortBy=submitDate&limit=12`, process.env.HOST_URL)
        )
        if (result.data.success) {
          if (result.data.result.length > 0) this.skins = this.skins.concat(result.data.result)
          else this.scrollSkinDisable = true
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
      }
    },
    async loadSkinScroll (index, done) {
      await this.fetchSkins((index - 1) * 12)
      done()
    }
  },
  created () {
    this.profile = this.$store.getters['tempProfile/getProfile']
    if (this.profile._id.length === 0) {
      this.$router.push('/404')
    } else if (process.env.CLIENT) {
      if (location.hash === '#skins') {
        this.tab = 'skins'
      } else if (location.hash === '#patterns') {
        this.tab = 'patterns'
      }
      document.title = `TECHMANIA | ${this.profile.name}`
    }
  }
}
</script>
