<template lang="pug">
q-card
  q-img(:src="getPatternPreview(pattern)" :ratio="16/9" height="150px")
  q-card-section
    router-link.no-underline(:to="getI18nRoute({ name: 'pattern', params: { id: pattern._id } })")
      .text-h6.text-tech {{ pattern.name }}
    .q-mt-md
      i18n-t(keypath="setlistPatternCard.submittedAt" tag="span")
        template(#date)
          | {{ formattedTime.relative }}
          q-tooltip.bg-black(anchor="top middle" self="bottom middle")
            | {{ formattedTime.text }}
      br
      i18n-t(keypath="setlistPatternCard.updatedAt" tag="span")
        template(#date)
          | {{ formattedUpdateTime.relative }}
          q-tooltip.bg-black(anchor="top middle" self="bottom middle")
            | {{ formattedUpdateTime.text }}
    .q-mt-md(:class="getLevelColor(pattern.difficulty.level)")
      q-icon.text-black.q-mr-md(
        size="sm"
        :name="getControlIcon(pattern.difficulty.control, pattern.difficulty.level)"
        :class="getLevelFilter(pattern.difficulty.level)"
      )
      | {{ `${pattern.difficulty.lanes}L ${pattern.difficulty.name} - Lv.${pattern.difficulty.level}` }}
  template(v-if="type === 'hidden'")
    q-separator
    template(v-if="last")
      q-card-section
        | {{ $t('setlistPage.hiddenPatterns.criteriaType.none') }}
    template(v-else)
      q-card-section
        | {{ $t('setlistPage.hiddenPatterns.criteriaType.' + criterias[pattern.criteriaType]) }}
        | &nbsp;
        | {{ $t('setlistPage.hiddenPatterns.criteriaDirection.' + criteriasDirections[pattern.criteriaDirection]) }}
        | &nbsp;
        | {{ pattern.criteriaValue }}
</template>

<script setup>
import { computed } from 'vue'
import { getLevelColor, getLevelFilter } from 'src/utils/level'
import { getControlIcon } from 'src/utils/control'
import { criterias, criteriasDirections } from 'src/utils/criteria'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import * as date from 'src/utils/date'
import { getI18nRoute } from 'src/i18n'

const props = defineProps({
  pattern: Object,
  last: Boolean,
  type: {
    type: String,
    default: 'selectable',
    validator(value) {
      return ['selectable', 'hidden'].includes(value)
    },
  },
})

const getPatternPreview = (pattern) => {
  return pattern.image?.length > 0
    ? pattern.image
    : pattern.previews.length > 0
      ? getYouTubeThumbnail(pattern.previews[0].ytid)
      : '/assets/header-pattern.png'
}

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
</script>
