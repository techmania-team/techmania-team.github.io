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
import { useQuery } from '@pinia/colada'
import sanitizeHtml from 'sanitize-html'
import { computed } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import CommentList from '@/components/CommentList.vue'
import YoutubeVideo from '@/components/YoutubeVideo.vue'
import { useLocalePath } from '@/composables/useLocalePath'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { getI18nRoute } from '@/i18n'
import { EMPTY_PATTERN, patternQuery } from '@/queries/pattern'
import { useUserStore } from '@/stores/user'
import { getControlIcon } from '@/utils/control'
import * as date from '@/utils/date'
import { toImageProxyUrl } from '@/utils/image'
import { toBreadcrumbList, toCreativeWork } from '@/utils/jsonLd'
import { getLevelColor, getLevelFilter } from '@/utils/level'
import { prefetchById } from '@/utils/prefetch'
import { toAbsoluteUrl } from '@/utils/url'
import { getYouTubeThumbnail } from '@/utils/youtube'

const { t } = useI18n()
const route = useRoute('pattern')
const user = useUserStore()
const pathOf = useLocalePath()

// preFetch has already filled this entry in, so nothing is fetched twice
const { data } = useQuery(() => patternQuery(route.params.id))
const pattern = computed(() => data.value ?? EMPTY_PATTERN)

const isImageError = ref(false)

const descriptionSanitized = computed(() => {
  return sanitizeHtml(pattern.value.description)
})

const backgroundImage = computed(() => {
  if (pattern.value.image?.length > 0 && !isImageError.value) {
    return toImageProxyUrl('patterns', pattern.value._id)
  } else if (pattern.value.previews?.length > 0) {
    return getYouTubeThumbnail(pattern.value.previews[0]!.ytid)
  } else {
    return toAbsoluteUrl('/assets/header-pattern.png')
  }
})

const onImageError = () => {
  isImageError.value = true
}

const description = computed(() =>
  t('patternPage.meta.description', {
    composer: pattern.value.composer,
    submitter: pattern.value.submitter.name,
  }),
)

useSeoMeta({
  title: () => t('patternPage.meta.title', { name: pattern.value.name }),
  description,
  image: backgroundImage,
  type: 'article',
  // Only once the document has loaded: the placeholder has no ids to link to
  jsonLd: () =>
    data.value && [
      toCreativeWork({
        ...pattern.value,
        description: description.value,
        image: backgroundImage.value,
        path: route.path,
        submitter: {
          name: pattern.value.submitter.name,
          path: pathOf({ name: 'profile-patterns', params: { id: pattern.value.submitter._id } }),
        },
      }),
      toBreadcrumbList([
        { name: 'TECHMANIA', path: pathOf({ name: 'index' }) },
        { name: t('nav.patterns'), path: pathOf({ name: 'patterns' }) },
        { name: pattern.value.name, path: route.path },
      ]),
    ],
})

defineOptions({
  async preFetch({ currentRoute, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<RouteNamedMap, 'pattern'>
    await prefetchById({ currentRoute, store }, route.params.id, patternQuery)
  },
})
</script>

<route lang="yaml">
name: pattern
meta:
  login: false
</route>
