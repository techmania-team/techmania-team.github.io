<template lang="pug">
q-card.full-height.card-skin
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
    q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" type="a" :href="skin.link" target="__blank")
    q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$router.push(getI18nRoute({ name: 'skin-form-edit', params: { id: skin._id}}))")
    //- Informations
    q-list
      //- Link
      q-item
        q-item-section.card-title
          router-link(:to="getI18nRoute({ name: 'skin', params: { id: skin._id } })")
            .text-h6 {{ skin.name }}
      //- Type
      q-item
        q-item-section
          span {{ $t('skinCard.type.label') }}: {{ $t('skinCard.type.' + types[skin.type]) }}
      //- Rating
      q-item
        q-item-section
          q-rating(:model-value="skin.rating.avg" readonly icon="star" icon-half="star_half" size='xs')
          | {{ skin.rating.avg.toFixed(2) }} / {{ $t('skinCard.comments.count', {count: skin.rating.count}) }}
      //- Date
      q-item
        q-item-section
          p
            span(v-if="!mine")
              | {{ $t('skinCard.submittedBy') }} &nbsp;
              router-link.no-underline(:to="getI18nRoute({ name: 'profile-skins', params: { id: skin.submitter._id}})") {{ skin.submitter.name }}
            br(v-if="!mine")
            span {{ $t('skinCard.submittedAt') }} {{ formattedTime.relative }}
              q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                | {{ formattedTime.text }}
            br
            span {{ $t('skinCard.updatedAt') }} {{ formattedUpdateTime.relative }}
              q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                | {{ formattedUpdateTime.text }}
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as date from 'src/utils/date'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import { types } from 'src/utils/skin'
import { getI18nRoute } from 'src/i18n'

const props = defineProps({
  skin: Object,
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
    relative: date.toRelative(props.skin.createdAt),
    text: date.toLocaleString(props.skin.createdAt),
  }
})

const formattedUpdateTime = computed(() => {
  return {
    relative: date.toRelative(props.skin.updatedAt),
    text: date.toLocaleString(props.skin.updatedAt),
  }
})

const clickHeader = () => {
  if (hasVideo.value) video.value = true
  else router.push(getI18nRoute({ name: 'skin', params: { id: props.skin._id } }))
}

onMounted(() => {
  videoLink.value = props.skin.previews?.[0]?.ytid || ''
  hasVideo.value = props.skin.previews?.[0]?.ytid !== undefined
  hasImage.value = props.skin.image?.length > 0 || false
  headerImage.value =
    props.skin.image?.length > 0
      ? props.skin.image
      : props.skin.previews.length > 0
        ? getYouTubeThumbnail(props.skin.previews[0].ytid)
        : '/assets/unknown.jpg'
})
</script>
