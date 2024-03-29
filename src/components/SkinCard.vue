<template lang="pug">
q-card.full-height.card-pattern
  q-video(v-if="video && hasVideo" :src="`https://www.youtube.com/embed/${videoLink}`" :ratio="16/9")
  q-img.cursor-pointer(v-else :src="headerImage" :ratio="16/9" @click="clickHeader")
    .absolute.full-width.full-height.flex.justify-center.items-center(v-if='hasVideo')
      h1.q-ma-none
        q-icon.text-white(name="play_circle_outline")
  q-card-section
    q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" type="a" :href="skin.link" target="__blank")
    q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$router.push('/skins/edit/' + skin._id)")
    q-list
      q-item
        q-item-section.card-title
          router-link(:to="'/skins/' + skin._id")
            .text-h6 {{ skin.name }}
      q-item
        q-item-section
          q-rating(v-model="skin.rating.rating" readonly icon="star" icon-half="star_half" size='xs')
          | {{ skin.rating.rating.toFixed(2) }} / {{ $t('pattern.ratingCount', {count: skin.rating.count}) }}
      q-item
        q-item-section
          p
            span(v-if="!mine")
              | {{ $t('pattern.submittedBy') }} &nbsp;
              router-link.no-underline(:to='`/users/${skin.submitter._id}/skins`') {{ skin.submitter.name }}
            br(v-if="!mine")
            span {{ $t('pattern.submitted') }} {{ formattedTime.relative }}
              q-tooltip(anchor="top middle" self="bottom middle" content-style="background: #000")
                | {{ formattedTime.text }}
            br
            span {{ $t('pattern.updated') }} {{ formattedUpdateTime.relative }}
              q-tooltip(anchor="top middle" self="bottom middle" content-style="background: #000")
                | {{ formattedUpdateTime.text }}
            br
            span {{ $t('submitSkinForm.skinType') }}: {{ typeName }}
</template>

<script>
import parseISO from 'date-fns/fp/parseISO'
export default {
  name: 'SkinCard',
  props: {
    skin: Object,
    mine: Boolean
  },
  data () {
    return {
      video: false,
      videoLink: '',
      hasVideo: false,
      hasImage: false,
      headerImage: ''
    }
  },
  computed: {
    formattedTime () {
      return {
        relative: this.$date.formatDistanceToNow(parseISO(this.skin.submitDate), { locale: this.$date.locales[this.user.locale2], addSuffix: true }),
        text: new Date(this.skin.submitDate).toLocaleString(this.user.locale)
      }
    },
    formattedUpdateTime () {
      return {
        relative: this.$date.formatDistanceToNow(parseISO(this.skin.updateDate), { locale: this.$date.locales[this.user.locale2], addSuffix: true }),
        text: new Date(this.skin.updateDate).toLocaleString(this.user.locale)
      }
    },
    typeName () {
      const type = [this.$t('skin.note'), this.$t('skin.vfx'), this.$t('skin.combo'), this.$t('skin.gameUI')]
      return type[this.skin.type]
    }
  },
  methods: {
    clickHeader () {
      if (this.hasVideo) this.video = true
      else this.$router.push('/skins/' + this.skin._id)
    }
  },
  created () {
    this.videoLink = this.skin.previews?.[0]?.ytid || ''
    this.hasVideo = this.skin.previews?.[0]?.ytid !== undefined
    this.hasImage = this.skin.image?.length > 0 || false
    this.headerImage = this.skin.image?.length > 0 ? this.skin.image : this.skin.previews.length > 0 ? this.getYouTubeThumbnail(this.skin.previews[0].ytid) : './assets/unknown.jpg'
  }
}
</script>
