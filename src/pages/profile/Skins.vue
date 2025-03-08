<template lang="pug">
#profile-skins
  .text-center.text-body1(v-if="skins.length === 0 && scrollSkinDisable") {{ $t('skins.notFound') }}
  q-infinite-scroll.row.q-my-md(@load="loadSkinScroll" :offset="200" :disable="scrollSkinDisable")
    .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="(skin, index) in skins" :key="skin.id")
      SkinCard(:skin="skin" :mine="mine")
    template(#loading)
      q-spinner-dots(color="tech" size="40px")
</template>

<script>
import SkinCard from '../../components/SkinCard'

export default {
  data () {
    return {
      skins: [],
      scrollSkinDisable: false
    }
  },
  components: {
    SkinCard
  },
  computed: {
    mine () {
      return this.$route.params._id === this.user._id
    }
  },
  methods: {
    async fetchSkins (start = 0) {
      try {
        const result = await this.$api.get(
          `/skins?submitter=${this.$route.params.id}&start=${start}&sort=-1&sortBy=createdAt&limit=12`,
        )
        if (result.data.success) {
          if (result.data.result.length > 0) this.skins = this.skins.concat(result.data.result)
          else this.scrollSkinDisable = true
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
        this.scrollSkinDisable = true
      }
    },
    async loadSkinScroll (index, done) {
      await this.fetchSkins((index - 1) * 12)
      done()
    }
  }
}
</script>
