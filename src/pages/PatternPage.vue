<template lang="pug">
q-page#pattern
  //- Background image
  section.bg(:style="{backgroundImage: `url(${backgroundImage})`}")
  //- Content
  section.q-mx-auto.padding
    .container
      .row
        .col-6.q-mx-auto
          h4 {{ pattern.name }}
        q-no-ssr.col-6.text-right
          h4
            q-btn.q-mr-xs(v-if="pattern.submitter._id === user._id" flat icon="edit" color="tech" :to="'/patterns/edit/' + pattern._id") {{ $t('pattern.edit') }}
            q-btn.q-mr-xs(flat icon="download" color="tech" type="a" :href="pattern.link" target="__blank") {{ $t('pattern.download') }}
      q-separator
      .row.q-my-md
        .col-12.col-md-6
          .text-h6.q-mt-md.q-mb-lg {{ $t('pattern.patternData') }}
          .q-gutter-sm
            div
              q-icon(size="sm" name="person")
              | &nbsp;{{ $t('pattern.composer') }} {{ pattern.composer }}
            div
              q-icon(size="sm" name="upload")
              | &nbsp;{{ $t('pattern.submittedBy') }}&nbsp;
              router-link.no-underline(:to='`/users/${pattern.submitter._id}/patterns`') {{ pattern.submitter.name }}
            div(:class="[{'text-red': !pattern.keysounded, 'text-positive': pattern.keysounded}]")
              q-icon(size="sm" :name="!pattern.keysounded ? 'close' : 'check'")
              | &nbsp;{{ $t('pattern.keysounded') }}
            .q-gutter-sm
              div.inline-block.q-mx-md(v-for="(difficulty, idx) in pattern.difficulties" :key="idx")
                q-icon(size="sm" :name="`img:/assets/icons/${difficulty.lanes}L.png`" :class="getLevelFilter(difficulty.level)")
                q-icon.text-black(size="sm" :name="getControlIcon(difficulty.control, difficulty.level)" :class="getLevelFilter(difficulty.level)")
                span(:class="getLevelColor(difficulty.level)") &nbsp;{{ difficulty.name }} Lv.{{ difficulty.level }}
        .col-12.col-md-6.pre-line.q-my-md.q-my-md-none
          .text-h6.q-mt-md.q-mb-lg {{ $t('pattern.description') }}
          .q-gutter-sm
            p(v-html="pattern.description" v-if="pattern.description")
            p(v-else) {{ $t('pattern.noDescription') }}
      .row.q-my-md
        .col-12
          .text-h6.q-mt-md.q-mb-lg.text-md-center {{ $t('pattern.previews') }}
          .q-gutter-sm
            .row.w-100.justify-center
              .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in pattern.previews" :key="idx")
                q-video(:ratio="16/9" :src="'https://www.youtube.com/embed/'+video.ytid")
              p.text-center(v-if='pattern.previews.length === 0') {{ $t('pattern.noPreview') }}
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import { useTempPatternStore } from 'src/stores/temp-pattern'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import { getLevelFilter, getLevelColor } from 'src/utils/level'
import { getControlIcon } from 'src/utils/control'

const route = useRoute()
const user = useUserStore()
const pattern = useTempPatternStore()

const backgroundImage = computed(() => {
  return pattern.image?.length > 0
    ? pattern.image
    : pattern.previews.length > 0
      ? getYouTubeThumbnail(pattern.previews[0].ytid)
      : 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
})

const metaData = () => ({
  title: `TECHMANIA | ${pattern.name}`,
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: `${pattern.name}`,
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: `Composed by ${pattern.composer}. Submitted by ${pattern.submitter.name}.`,
      'data-dynamic': true,
    },
    ogType: {
      property: 'og:type',
      content: 'website',
      'data-dynamic': true,
    },
    ogUrl: {
      property: 'og:url',
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
      'data-dynamic': true,
    },
    ogTitle: {
      property: 'og:title',
      content: `TECHMANIA | ${pattern.name}`,
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: `Composed by ${pattern.composer}. Submitted by ${pattern.submitter.name}.`,
      'data-dynamic': true,
    },
    ogImage: {
      property: 'og:image',
      content: backgroundImage.value,
      'data-dynamic': true,
    },
    twCard: {
      name: 'twitter:card',
      content: 'summary_large_image',
      'data-dynamic': true,
    },
    twUrl: {
      name: 'twitter:url',
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
      'data-dynamic': true,
    },
    twTitle: {
      name: 'twitter:title',
      content: `TECHMANIA | ${pattern.name}`,
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: `Composed by ${pattern.composer}. Submitted by ${pattern.submitter.name}.`,
      'data-dynamic': true,
    },
    twImage: {
      name: 'twitter:image',
      content: backgroundImage.value,
      'data-dynamic': true,
    },
  },
})
useMeta(metaData)

defineOptions({
  async preFetch({ currentRoute }) {
    // Prefetch pattern data
    const pattern = useTempPatternStore()
    pattern.clearData()
    await pattern.fetchPattern(currentRoute.params.id)
  },
})

onUnmounted(() => {
  pattern.clearData()
})
</script>
