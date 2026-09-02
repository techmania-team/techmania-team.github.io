<template lang="pug">
q-card.full-height.card-setlist
  //- Header image
  q-img.cursor-pointer(:src="headerImage" :ratio="16/9" @click="onHeaderClick" @error="onImageError")
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
                router-link.no-underline(:to="getI18nRoute({ name: 'profile-setlists', params: { id: setlist.submitter._id}})") {{ setlist.submitter.name }}
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
q-dialog(v-model="showVideoDialog" backdrop-filter="blur(4px)")
  q-card(style="width: 800px; max-width: 90vw;")
    q-bar.bg-dark.text-white
      div {{ setlist.name }}
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
import type { ISetlist } from '@/types/setlist'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getI18nRoute } from '@/i18n'
import { controls } from '@/utils/control'
import * as date from '@/utils/date'
import { toImageProxyUrl } from '@/utils/image'
import { getYouTubeThumbnail } from '@/utils/youtube'

const props = defineProps<{
  setlist: ISetlist
  mine: boolean
}>()

const videoLink = ref('')
const hasVideo = ref(false)
const showVideoDialog = ref(false)
const isImageError = ref(false)

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

const headerImage = computed(() => {
  if (props.setlist.image?.length > 0 && !isImageError.value) {
    return toImageProxyUrl('setlists', props.setlist._id)
  } else if (props.setlist.previews?.length > 0) {
    return getYouTubeThumbnail(props.setlist.previews[0]!.ytid)
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
        name: 'setlist',
        params: { id: props.setlist._id },
      }),
    )
  }
}

onMounted(() => {
  videoLink.value = props.setlist.previews?.[0]?.ytid || ''
  hasVideo.value = props.setlist.previews?.[0]?.ytid !== undefined
})
</script>
