<template lang="pug">
q-card.full-height.card-pattern
  //- Header image
  q-img.cursor-pointer(:src="headerImage" :ratio="16/9" @click="onHeaderClick" @error="onImageError")
    .absolute.full-width.full-height.flex.justify-center.items-center(v-if='hasVideo')
      h1.q-ma-none
        q-icon.text-white(name="play_circle_outline")
  //- Content
  q-card-section
    //- Download or edit button
    q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" type="a" :href="pattern.link" target="__blank")
    q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" :to="getI18nRoute({ name: 'pattern-form-edit', params: { id: pattern._id}})")
    //- Informations
    q-list
      //- Link
      q-item
        q-item-section.card-title
          router-link(:to="getI18nRoute({ name: 'pattern', params: { id: pattern._id } })")
            .text-h6 {{ pattern.name }}
            .text-subtitle {{ pattern.composer }}
      //- Rating
      q-item
        q-item-section
          q-rating(:model-value="pattern.rating.avg" readonly icon="star" icon-half="star_half" size='xs')
          | {{ pattern.rating.avg.toFixed(2) }} / {{ $t('patternCard.comments.count', { count: pattern.rating.count}) }}
      //- Date
      q-item
        q-item-section
          p
            i18n-t(keypath="patternCard.submittedBy" tag="span" v-if="!mine")
              template(#name)
                router-link.no-underline(:to="getI18nRoute({ name: 'profile-patterns', params: { id: pattern.submitter._id}})") {{ pattern.submitter.name }}
            br(v-if="!mine")
            i18n-t(keypath="patternCard.submittedAt" tag="span")
              template(#date)
                | {{ formattedTime.relative }}
                q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                  | {{ formattedTime.text }}
            br
            i18n-t(keypath="patternCard.updatedAt" tag="span")
              template(#date)
                | {{ formattedUpdateTime.relative }}
                q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                  | {{ formattedUpdateTime.text }}
      //- Keysounded
      q-item
        q-item-section
          div(:class="[{'text-red': !pattern.keysounded, 'text-positive': pattern.keysounded}]")
            q-icon(size="sm" :name="!pattern.keysounded ? 'close' : 'check'")
            | &nbsp;{{ $t('patternCard.keysounded') }}
      //- Lanes
      q-item
        q-item-section
          div.q-gutter-sm.q-my-sm
            template(v-for="(value, key) in hasLanes" :key="key")
              q-icon(v-if="value" class="filter-positive" size="sm" :name="`img:/assets/icons/${key}L.png`")
      //- Difficulties and controls
      q-item
        q-item-section
          div.q-gutter-sm
            q-icon.text-black(
              v-for="(difficulty, index) in pattern.difficulties"
              :key="'D'+index"
              size="sm"
              :name="getControlIcon(difficulty.control)"
              :class="getLevelFilter(difficulty.level)"
            )
              q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                | {{ $t('patternCard.control.'+controls[difficulty.control]) }} / {{ difficulty.lanes }}L / {{ difficulty.name }}
                br
                span.text-bold(:class="getLevelColor(difficulty.level)") Lv.{{ difficulty.level }}
q-dialog(v-model="showVideoDialog" backdrop-filter="blur(4px)")
  q-card(style="width: 800px; max-width: 90vw;")
    q-bar.bg-dark.text-white
      div {{ pattern.name }}
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
import type { IPattern } from '@/types/pattern'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getI18nRoute } from '@/i18n'
import { getControlIcon } from '@/utils/control'
import { controls } from '@/utils/control'
import * as date from '@/utils/date'
import { toImageProxyUrl } from '@/utils/image'
import { getLevelColor, getLevelFilter } from '@/utils/level'
import { getYouTubeThumbnail } from '@/utils/youtube'

const props = defineProps<{
  mine: boolean
  pattern: IPattern
}>()

const videoLink = ref('')
const hasVideo = ref(false)
const showVideoDialog = ref(false)
const isImageError = ref(false)

const router = useRouter()

const formattedTime = computed(() => {
  return {
    relative: date.toRelative(props.pattern.createdAt),
    text: date.toLocaleString(props.pattern.createdAt),
  }
})

const formattedUpdateTime = computed(() => {
  return {
    relative: date.toRelative(props.pattern.updatedAt),
    text: date.toLocaleString(props.pattern.updatedAt),
  }
})

const hasLanes = computed(() => {
  const lanes = { 2: false, 3: false, 4: false }
  props.pattern.difficulties.forEach((difficulty) => {
    lanes[difficulty.lanes] = true
  })
  return lanes
})

const headerImage = computed(() => {
  if (props.pattern.image?.length > 0 && !isImageError.value) {
    return toImageProxyUrl('patterns', props.pattern._id)
  } else if (props.pattern.previews?.length > 0) {
    return getYouTubeThumbnail(props.pattern.previews[0]!.ytid)
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
        name: 'pattern',
        params: { id: props.pattern._id },
      }),
    )
  }
}

onMounted(() => {
  videoLink.value = props.pattern.previews?.[0]?.ytid || ''
  hasVideo.value = props.pattern.previews?.[0]?.ytid !== undefined
})
</script>
