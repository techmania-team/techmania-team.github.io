<template lang="pug">
.youtube-video-container
  q-img.cursor-pointer(:src="headerImage" :ratio="16/9" @click="onHeaderClick")
    .absolute.full-width.full-height.flex.justify-center.items-center.video-play
      h1.q-ma-none
        q-icon.text-white(name="play_circle_outline")
  q-dialog(v-model="showVideoDialog" backdrop-filter="blur(4px)")
    q-card(style="width: 1000px; max-width: 90vw;")
      q-bar.bg-dark.text-white
        div {{ name }}
        q-space
        q-btn(dense flat icon="close" v-close-popup)
      q-card-section.q-pa-none
        q-video(
          v-if="showVideoDialog"
          :src="`https://www.youtube-nocookie.com/embed/${ytid}?autoplay=1`"
          :ratio="16/9"
          loading="lazy"
        )
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getYouTubeThumbnail } from '@/utils/youtube'

const props = defineProps<{
  ytid: string
  name: string
  img?: string
}>()

const showVideoDialog = ref(false)

const headerImage = computed(() => {
  return props.img ? props.img : getYouTubeThumbnail(props.ytid)
})

const onHeaderClick = () => {
  showVideoDialog.value = true
}

defineExpose({
  open: () => (showVideoDialog.value = true),
})
</script>
