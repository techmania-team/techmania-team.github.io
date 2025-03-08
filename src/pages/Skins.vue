<template lang="pug">
q-page#skins
  section.q-mx-auto.padding
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('nav.skins') }}
          q-separator.q-my-md
          br
          q-input(rounded outlined v-model="searchForm.keywords" :placeholder="$t('patterns.search')" @keydown.enter="applySearch")
            template(#after)
              q-btn(icon="search" round desnse flat @click="applySearch")
          br
          q-list.search
            q-item
              q-item-section {{ $t('submitSkinForm.skinType') }}
              q-item-section
                div
                  q-option-group(inline :options="typeOptions" type="checkbox" v-model="searchForm.types")
            q-item
              q-item-section {{ $t('patterns.sort') }}
              q-item-section
                div
                  q-btn(flat size="10px" :label="$t('patterns.sortSubmit')" :icon-right="getSortIcon('createdAt')" :text-color="searchForm.sortBy === 'createdAt' ? 'white' : 'grey'" @click="changeSort('createdAt')")
                  q-btn(flat size="10px" :label="$t('patterns.sortUpdate')" :icon-right="getSortIcon('updatedAt')" :text-color="searchForm.sortBy === 'updatedAt' ? 'white' : 'grey'" @click="changeSort('updatedAt')")
                  q-btn(flat size="10px" :label="$t('skins.sortName')" :icon-right="getSortIcon('name')" :text-color="searchForm.sortBy === 'name' ? 'white' : 'grey'" @click="changeSort('name')")
                  q-btn(flat size="10px" :label="$t('pattern.rating')" :icon-right="getSortIcon('rating')" :text-color="searchForm.sortBy === 'rating' ? 'white' : 'grey'" @click="changeSort('rating')")
          q-separator.q-my-md
          q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
            .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(skin, index) in skins" :key="skin.id")
              SkinCard(:skin="skin" :mine="false")
            template(#loading)
              q-spinner-dots(color="tech" size="40px")
          .text-center.text-body1(v-if="skins.length === 0 && scrollDisable") {{ $t('skins.notFound') }}
  q-no-ssr
    q-page-sticky(position="bottom-right" :offset="[36,36]" v-if="user.isLogin")
      q-btn(fab icon="add" color="tech" text-color="black" @click="$router.push('/skins/new')")
</template>

<script>
import SkinCard from '../components/SkinCard'

export default {
  name: 'PageSkins',
  meta () {
    return {
      title: 'TECHMANIA | Skins',
      meta: {
        color: {
          name: 'theme-color',
          content: '#E74C3C'
        },
        title: {
          name: 'title',
          content: 'TECHMANIA | Skins'
        },
        description: {
          name: 'description',
          content: 'Skins for TECHMANIA.'
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
          content: 'TECHMANIA | Skins'
        },
        ogDescription: {
          property: 'og:description',
          content: 'Skins for TECHMANIA.'
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
          content: 'TECHMANIA | Skins'
        },
        twDescription: {
          name: 'twitter:description',
          content: 'Skins for TECHMANIA.'
        },
        twImage: {
          name: 'twitter:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
        }
      }
    }
  },
  components: {
    SkinCard
  },
  data () {
    return {
      skins: [],
      filter: '',
      error: false,
      submitModel: false,
      searchForm: {
        keywords: '',
        sort: -1,
        types: [0, 1, 2, 3],
        sortBy: 'createdAt',
      },
      search: {
        keywords: '',
        sort: -1,
        types: [0, 1, 2, 3],
        sortBy: 'createdAt',
      },
      scrollDisable: false
    }
  },
  computed: {
    typeOptions () {
      return [
        { label: this.$t('skin.note'), value: 0 },
        { label: this.$t('skin.vfx'), value: 1 },
        { label: this.$t('skin.combo'), value: 2 },
        { label: this.$t('skin.gameUI'), value: 3 }
      ]
    }
  },
  methods: {
    async fetchSkins (start = 0) {
      try {
        const result = await this.$api.get(
          `/skins?start=${start}&keywords=${this.search.keywords}&types=${this.search.types.join()}&sort=${this.search.sort}&sortBy=${this.search.sortBy}&limit=12`
        )
        if (result.data.success) {
          if (result.data.result.length > 0) this.skins = this.skins.concat(result.data.result)
          else this.scrollDisable = true
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
        this.scrollDisable = true
      }
    },
    async loadScroll (index, done) {
      await this.fetchSkins((index - 1) * 12)
      done()
    },
    applySearch () {
      this.skins = []
      this.search.keywords = this.searchForm.keywords
      this.search.sort = this.searchForm.sort
      this.search.types = this.searchForm.types
      this.search.sortBy = this.searchForm.sortBy
      this.scrollDisable = false
      this.fetchSkins()
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
