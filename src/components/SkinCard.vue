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
    q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$router.push('/skins/edit/' + skin._id)")
    //- Informations
    q-list
      //- Link
      q-item
        q-item-section.card-title
          router-link(:to="'/skins/' + skin._id")
            .text-h6 {{ skin.name }}
      //- Type
      q-item
        q-item-section
          span {{ $t('submitSkinForm.skinType') }}: {{ typeName }}
      //- Rating
      q-item
        q-item-section
          q-rating(:model-value="skin.rating.rating" readonly icon="star" icon-half="star_half" size='xs')
          | {{ skin.rating.rating.toFixed(2) }} / {{ $t('pattern.ratingCount', {count: skin.rating.count}) }}
      //- Date
      q-item
        q-item-section
          p
            span(v-if="!mine")
              | {{ $t('pattern.submittedBy') }} &nbsp;
              router-link.no-underline(:to='`/users/${skin.submitter._id}/skins`') {{ skin.submitter.name }}
            br(v-if="!mine")
            span {{ $t('pattern.submitted') }} {{ formattedTime.relative }}
              q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                | {{ formattedTime.text }}
            br
            span {{ $t('pattern.updated') }} {{ formattedUpdateTime.relative }}
              q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                | {{ formattedUpdateTime.text }}
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as date from 'src/utils/date'
import { useRouter } from 'vue-router'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import { useI18n } from 'vue-i18n'

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
const { t } = useI18n()

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

const typeName = computed(() => {
  const type = [t('skin.note'), t('skin.vfx'), t('skin.combo'), t('skin.gameUI')]
  return type[props.skin.type]
})

const clickHeader = () => {
  if (hasVideo.value) video.value = true
  else router.push('/skins/' + props.skin._id)
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
