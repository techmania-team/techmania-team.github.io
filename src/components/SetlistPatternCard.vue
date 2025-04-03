<template lang="pug">
q-card
  q-img(:src="getPatternPreview(pattern)" :ratio="16/9" height="150px")
  q-card-section
    router-link.no-underline(:to="getI18nRoute({ name: 'pattern', params: { id: pattern._id } })")
      .text-h6.text-tech {{ pattern.name }}
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
import { getLevelColor, getLevelFilter } from 'src/utils/level'
import { getControlIcon } from 'src/utils/control'
import { criterias, criteriasDirections } from 'src/utils/criteria'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import { getI18nRoute } from 'src/i18n'

defineProps({
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
</script>
