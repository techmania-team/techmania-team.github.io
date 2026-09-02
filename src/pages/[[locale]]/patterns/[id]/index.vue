<template lang="pug">
q-page#pattern
  //- Header
  q-parallax.header-parallax(:height="200")
    //- Header image background
    template(#media)
      q-img(:src="backgroundImage" @error="onImageError")
    //- Header content
    template(#content)
      .column.items-center.q-mb-md
        .text-h4.text-center {{ pattern.name }}
        .text-h6.text-center {{ pattern.composer }}
      .row.q-gutter-md
        q-btn(color="secondary" icon="download" :href="pattern.link" target="__blank" rel="noopener noreferrer") {{ $t('patternPage.download') }}
        q-btn(color="secondary" icon="edit" v-if="pattern.submitter._id === user._id" :to="getI18nRoute({ name: 'pattern-form-edit', params: { id: pattern._id }})") {{ $t('patternPage.edit') }}
  //- Content
  section.q-mx-auto.padding.q-mt-lg
    .container
      //- Information
      .row.q-col-gutter-y-lg
        //- Pattern info list
        .col-12
          q-list
            //- List header
            q-item-label.text-h6.text-tech(header) {{ $t('patternPage.basic.title') }}
            q-separator.q-mb-md(inset)
          .row.q-col-gutter-md
            //- List items - Submitted by
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="upload")
                q-item-section
                  q-item-label {{ $t('patternPage.basic.submittedBy.label') }}
                  q-item-label(caption)
                    //- NOTE:
                    //- v-if is a workaround here to prevent error
                    //- When go to edit page, prefetch function clears pattern data
                    //- This will make pattern._id empty, and cause router error: Missing required param "id"
                    //- Edit (Prefetch, clear data) --> Pattern(onUnmounted, error)
                    template(v-if="pattern.submitter._id.length > 0")
                      router-link.no-underline(:to="getI18nRoute({ name: 'profile-patterns', params: { id: pattern.submitter._id}})") {{ pattern.submitter.name }}
            //- List items - Rating
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="thumb_up_alt")
                q-item-section
                  q-item-label
                    q-rating(:model-value="pattern.rating?.avg || 0" readonly icon="star" icon-half="star_half" size='xs')
                  q-item-label(caption)
                    | {{ pattern.rating?.avg?.toFixed(2) || '' }} / {{ $t('patternPage.basic.comments.count', {count: pattern.rating.count}) }}
            //- List items - Submitted at
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="calendar_month")
                q-item-section
                  q-item-label {{ $t('patternPage.basic.submittedAt.label') }}
                  q-item-label(caption)
                    | {{ date.toLocaleString(pattern.createdAt) }}
                    | &nbsp;
                    | ({{ date.toRelative(pattern.createdAt) }})
            //- List items - Updated at
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="update")
                q-item-section
                  q-item-label {{ $t('patternPage.basic.updatedAt.label') }}
                  q-item-label(caption)
                    | {{ date.toLocaleString(pattern.updatedAt) }}
                    | &nbsp;
                    | ({{ date.toRelative(pattern.updatedAt) }})
            //- List items - Composer
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="person")
                q-item-section
                  q-item-label {{ $t('patternPage.basic.composer.label') }}
                  q-item-label(caption) {{ pattern.composer }}
            //- List items - Keysounded
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="music_note")
                q-item-section
                  q-item-label {{ $t('patternPage.basic.keysounded.label') }}
                  q-item-label(caption :class="[{'text-red': !pattern.keysounded, 'text-positive': pattern.keysounded}]")
                    | {{ $t(`patternPage.basic.keysounded.${pattern.keysounded ? 'yes' : 'no'}`) }}
        //- Difficulty list
        .col-12
          q-list
            q-item-label.text-h6.text-tech(header) {{ $t('patternPage.difficulties.title')}}
            q-separator.q-mb-md(inset)
            q-item
              q-item-section
                .row.q-col-gutter-y-lg
                  .col-3.col-md-2.text-center(v-for="(difficulty, idx) in pattern.difficulties" :key="idx")
                    div.q-mx-auto
                      q-icon(size="24px" :name="`img:/assets/icons/${difficulty.lanes}L.png`" :class="getLevelFilter(difficulty.level)")
                      q-icon.text-black(size="sm" :name="getControlIcon(difficulty.control)" :class="getLevelFilter(difficulty.level)")
                    div(:class="getLevelColor(difficulty.level)") Lv.{{ difficulty.level }}
                    div(:class="getLevelColor(difficulty.level)") {{ difficulty.name }}
        //- Description
        //- NOTE:
        //- Use q-no-ssr to prevent hydration error
        .col-12.pre-line
          q-no-ssr
            q-list
              q-item-label.text-h6.text-tech(header) {{ $t('patternPage.description.title') }}
              q-separator.q-mb-md(inset)
              q-item
                q-item-section
                  p(v-html="descriptionSanitized" v-if="pattern.description")
                  p(v-else) {{ $t('patternPage.description.noDescription') }}
        //- Previews
        .col-12
          q-list
            q-item-label.text-h6.text-tech(header) {{ $t('patternPage.previews.title') }}
            q-separator.q-mb-md(inset)
          .row.justify-center.q-col-gutter-md
            .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in pattern.previews" :key="idx")
              YoutubeVideo(:ytid="video.ytid" :name="video.name")
              p.text-center.q-mt-md {{ video.name }}
            p.text-center(v-if='pattern.previews.length === 0') {{ $t('patternPage.previews.noPreview') }}
      //- Comments
      CommentList(type="pattern" :id="pattern._id" v-if="pattern._id.length > 0")
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoadedTyped } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'
import { useMeta } from 'quasar'
import sanitizeHtml from 'sanitize-html'
import validator from 'validator'
import { computed, onUnmounted } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import CommentList from '@/components/CommentList.vue'
import YoutubeVideo from '@/components/YoutubeVideo.vue'
import { getI18nRoute } from '@/i18n'
import { useTempPatternStore } from '@/stores/temp-pattern'
import { useUserStore } from '@/stores/user'
import { getControlIcon } from '@/utils/control'
import * as date from '@/utils/date'
import { toImageProxyUrl } from '@/utils/image'
import { getLevelColor, getLevelFilter } from '@/utils/level'
import { getYouTubeThumbnail } from '@/utils/youtube'

const { t } = useI18n()
const route = useRoute()
const user = useUserStore()
const pattern = useTempPatternStore()

const isImageError = ref(false)

const descriptionSanitized = computed(() => {
  return sanitizeHtml(pattern.description)
})

const backgroundImage = computed(() => {
  if (pattern.image?.length > 0 && !isImageError.value) {
    return toImageProxyUrl('patterns', pattern._id)
  } else if (pattern.previews?.length > 0) {
    return getYouTubeThumbnail(pattern.previews[0]!.ytid)
  } else {
    return '/assets/header-pattern.png'
  }
})

const onImageError = () => {
  isImageError.value = true
}

const metaData = () => ({
  title: t('patternPage.meta.title', { name: pattern.name }),
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: t('patternPage.meta.title', { name: pattern.name }),
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: t('patternPage.meta.description', {
        composer: pattern.composer,
        submitter: pattern.submitter.name,
      }),
      'data-dynamic': true,
    },
    ogType: {
      property: 'og:type',
      content: 'website',
    },
    ogUrl: {
      property: 'og:url',
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    ogTitle: {
      property: 'og:title',
      content: t('patternPage.meta.title', { name: pattern.name }),
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: t('patternPage.meta.description', {
        composer: pattern.composer,
        submitter: pattern.submitter.name,
      }),
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
    },
    twUrl: {
      name: 'twitter:url',
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    twTitle: {
      name: 'twitter:title',
      content: t('patternPage.meta.title', { name: pattern.name }),
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: t('patternPage.meta.description', {
        composer: pattern.composer,
        submitter: pattern.submitter.name,
      }),
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
  // RouteLocationNormalizedLoadedTyped
  async preFetch({ currentRoute, redirect, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<RouteNamedMap, 'pattern'>
    // Prefetch pattern data
    const pattern = useTempPatternStore(store)
    if (pattern._id !== route.params.id) {
      pattern.clearData()
    }

    if (!route.params.id || !validator.isMongoId(route.params.id)) {
      redirect({ name: 'index' })
      return
    }

    await pattern.fetchPattern(route.params.id)

    // Check if pattern exists and user is the submitter
    if (pattern._id.length === 0) {
      redirect({ name: 'index' })
      return
    }
  },
})

onUnmounted(() => {
  // NOTE:
  // When going to pattern edit page
  // Clear pattern data when unmounting will cause pattern edit page to lose data
  // Edit (Prefetch) --> Pattern(onUnmounted) --> Edit (onMounted)
  // pattern.clearData()
})
</script>

<route lang="yaml">
name: pattern
meta:
  login: false
</route>
