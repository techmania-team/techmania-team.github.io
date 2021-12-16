<template lang="pug">
q-card.full-height.card-skin
  q-video(v-if="video" :src="`https://www.youtube.com/embed/${skin.previews[0].ytid}`" :ratio="16/9")
  q-img.cursor-pointer(v-else :src="getYouTubeThumbnail(skin.previews[0].ytid)" :ratio="16/9" @click="video = true")
    .absolute.full-width.full-height.flex.justify-center.items-center
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
          p
            span(v-if="!mine")
              | {{ $t('pattern.submittedBy') }} &nbsp;
              router-link.no-underline(:to='`/users/${skin.submitter._id}/#skins`') {{ skin.submitter.name }}
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
      video: false
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
  }
}
</script>
