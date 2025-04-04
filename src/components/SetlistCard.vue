<template lang="pug">
q-card.full-height.card-setlist
  //- Header video
  q-video(v-if="video && hasVideo" :src="`https://www.youtube.com/embed/${videoLink}`" :ratio="16/9")
  //- Header image
  q-img.cursor-pointer(v-else :src="headerImage" :ratio="16/9" @click="clickHeader")
    .absolute.full-width.full-height.flex.justify-center.items-center(v-if='hasVideo')
      h1.q-ma-none
        q-icon.text-white(name="play_circle_outline")
  //- Content
  q-card-section
    //- Download or edit button
    q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" type="a" :href="setlist.link" target="__blank")
    q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$router.push(getI18nRoute({ name: 'setlist-form-edit', params: { id: setlist._id}}))")
    //- Informations
    q-list
      //- Link
      q-item
        q-item-section.card-title
          router-link(:to="getI18nRoute({ name: 'setlist', params: { id: setlist._id } })")
            .text-h6 {{ setlist.name }}
      //- Rating
      q-item
        q-item-section
          q-rating(:model-value="setlist.rating.avg" readonly icon="star" icon-half="star_half" size='xs')
          | {{ setlist.rating.avg.toFixed(2) }} / {{ $t('setlistCard.comments.count', {count: setlist.rating.count}) }}
      //- Control
      q-item
        q-item-section
          | {{ $t('setlistCard.control.label') }} : {{ $t('setlistCard.control.' + controls[setlist.control]) }}
      //- Patterns
      q-item
        q-item-section
          | {{ $t('setlistCard.selectablePatterns') }} : {{ setlist.selectablePatterns.length }}
          br
          | {{ $t('setlistCard.hiddenPatterns') }} : {{ setlist.hiddenPatterns.length }}
      //- Date
      q-item
        q-item-section
          p
            i18n-t(keypath="setlistCard.submittedBy" tag="span" v-if="!mine")
              template(#name)
                router-link.no-underline(:to="getI18nRoute({ name: 'profile', params: { tab: 'setlists', id: setlist.submitter._id}})") {{ setlist.submitter.name }}
            br(v-if="!mine")
            i18n-t(keypath="setlistCard.submittedAt" tag="span")
              template(#date)
                | {{ formattedTime.relative }}
                q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                  | {{ formattedTime.text }}
            br
            i18n-t(keypath="setlistCard.updatedAt" tag="span")
              template(#date)
                | {{ formattedUpdateTime.relative }}
                q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                  | {{ formattedUpdateTime.text }}
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as date from 'src/utils/date'
import { controls } from 'src/utils/control'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import { getI18nRoute } from 'src/i18n'

const props = defineProps({
  setlist: Object,
  mine: Boolean,
})

const video = ref(false)
const videoLink = ref('')
const hasVideo = ref(false)
const hasImage = ref(false)
const headerImage = ref('')

const router = useRouter()

const formattedTime = computed(() => {
  return {
    relative: date.toRelative(props.setlist.createdAt),
    text: date.toLocaleString(props.setlist.createdAt),
  }
})

const formattedUpdateTime = computed(() => {
  return {
    relative: date.toRelative(props.setlist.updatedAt),
    text: date.toLocaleString(props.setlist.updatedAt),
  }
})

const clickHeader = () => {
  if (hasVideo.value) video.value = true
  else router.push(getI18nRoute({ name: 'setlist', params: { id: props.setlist._id } }))
}

onMounted(() => {
  videoLink.value = props.setlist.previews?.[0]?.ytid || ''
  hasVideo.value = props.setlist.previews?.[0]?.ytid !== undefined
  hasImage.value = props.setlist.image?.length > 0 || false
  headerImage.value =
    props.setlist.image?.length > 0
      ? props.setlist.image
      : props.setlist.previews.length > 0
        ? getYouTubeThumbnail(props.setlist.previews[0].ytid)
        : '/assets/unknown.jpg'
})
</script>
