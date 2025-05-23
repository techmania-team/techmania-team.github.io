<template lang="pug">
q-card.full-height.card-pattern
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
    q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" type="a" :href="pattern.link" target="__blank")
    q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$router.push(getI18nRoute({ name: 'pattern-form-edit', params: { id: pattern._id}}))")
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
                router-link.no-underline(:to="getI18nRoute({ name: 'profile', params: { tab: 'patterns', id: pattern.submitter._id}})") {{ pattern.submitter.name }}
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
              :name="getControlIcon(difficulty.control, difficulty.level)"
              :class="getLevelFilter(difficulty.level)"
            )
              q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                | {{ $t('patternCard.control.'+controls[difficulty.control]) }} / {{ difficulty.lanes }}L / {{ difficulty.name }}
                br
                span.text-bold(:class="getLevelColor(difficulty.level)") Lv.{{ difficulty.level }}
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as date from 'src/utils/date'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import { getControlIcon } from 'src/utils/control'
import { getLevelFilter, getLevelColor } from 'src/utils/level'
import { controls } from 'src/utils/control'
import { getI18nRoute } from 'src/i18n'

const props = defineProps({
  pattern: Object,
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

const clickHeader = () => {
  if (hasVideo.value) video.value = true
  else router.push(getI18nRoute({ name: 'pattern', params: { id: props.pattern._id } }))
}

onMounted(() => {
  videoLink.value = props.pattern.previews?.[0]?.ytid || ''
  hasVideo.value = props.pattern.previews?.[0]?.ytid !== undefined
  hasImage.value = props.pattern.image?.length > 0 || false
  headerImage.value =
    props.pattern.image?.length > 0
      ? props.pattern.image
      : props.pattern.previews.length > 0
        ? getYouTubeThumbnail(props.pattern.previews[0].ytid)
        : '/assets/unknown.jpg'
})
</script>
