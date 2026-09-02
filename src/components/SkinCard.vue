<template lang="pug">
q-card.full-height.card-skin
  //- Header image
  q-img.cursor-pointer(:src="headerImage" :ratio="16/9" @click="onHeaderClick" @error="onImageError")
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
          span {{ $t('skinCard.type.label') }}: {{ (Array.isArray(skin.type) ? skin.type : [skin.type]).map((t) => $t('skinCard.type.' + SKINTYPES[t])).join(', ') }}
      //- Rating
      q-item
        q-item-section
          q-rating(:model-value="skin.rating.avg" readonly icon="star" icon-half="star_half" size='xs')
          | {{ skin.rating.avg.toFixed(2) }} / {{ $t('skinCard.comments.count', {count: skin.rating.count}) }}
      //- Date
      q-item
        q-item-section
          p
            i18n-t(keypath="skinCard.submittedBy" tag="span" v-if="!mine")
              template(#name)
                router-link.no-underline(:to="getI18nRoute({ name: 'profile-skins', params: { id: skin.submitter._id}})") {{ skin.submitter.name }}
            br(v-if="!mine")
            i18n-t(keypath="skinCard.submittedAt" tag="span")
              template(#date)
                | {{ formattedTime.relative }}
                q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                  | {{ formattedTime.text }}
            br
            i18n-t(keypath="skinCard.updatedAt" tag="span")
              template(#date)
                | {{ formattedUpdateTime.relative }}
                q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                  | {{ formattedUpdateTime.text }}
q-dialog(v-model="showVideoDialog" backdrop-filter="blur(4px)")
  q-card(style="width: 800px; max-width: 90vw;")
    q-bar.bg-dark.text-white
      div {{ skin.name }}
      q-space
      q-btn(dense flat icon="close" v-close-popup)
    q-card-section.q-pa-none
      q-video(
        v-if="showVideoDialog"
        :src="`https://www.youtube-nocookie.com/embed/${videoLink}?autoplay=1`"
        :ratio="16/9"
      )
</template>

<script setup lang="ts">
import type { ISkin } from '@/types/skin'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getI18nRoute } from '@/i18n'
import * as date from '@/utils/date'
import { toImageProxyUrl } from '@/utils/image'
import { SKINTYPES } from '@/utils/skin'
import { getYouTubeThumbnail } from '@/utils/youtube'

const props = defineProps<{
  skin: ISkin
  mine: boolean
}>()

const videoLink = ref('')
const hasVideo = ref(false)
const showVideoDialog = ref(false)
const isImageError = ref(false)

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

const headerImage = computed(() => {
  if (props.skin.image?.length > 0 && !isImageError.value) {
    return toImageProxyUrl('skins', props.skin._id)
  } else if (props.skin.previews?.length > 0) {
    return getYouTubeThumbnail(props.skin.previews[0]!.ytid)
  } else {
    return '/assets/unknown.jpg'
  }
})

const onImageError = () => {
  isImageError.value = true
}

const onHeaderClick = async () => {
  if (hasVideo.value && videoLink.value) {
    showVideoDialog.value = true
  } else {
    await router.push(
      getI18nRoute({
        name: 'skin',
        params: { id: props.skin._id },
      }),
    )
  }
}

onMounted(() => {
  videoLink.value = props.skin.previews?.[0]?.ytid || ''
  hasVideo.value = props.skin.previews?.[0]?.ytid !== undefined
})
</script>
