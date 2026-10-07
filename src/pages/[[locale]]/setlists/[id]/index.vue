<template lang="pug">
q-page#setlist
  //- Header
  q-parallax.header-parallax(:height="200")
    //- Header image background
    template(#media)
      q-img(:src="backgroundImage" @error="onImageError")
    //- Header content
    template(#content)
      .column.items-center.q-mb-md
        h1.text-h4.text-center.q-my-none {{ setlist.name }}
      .row.q-gutter-x-md
        q-btn(color="secondary" icon="download" :href="setlist.link" target="__blank" rel="noopener noreferrer") {{ $t('setlistPage.download') }}
        q-btn(color="secondary" icon="edit" v-if="setlist.submitter._id === user._id" :to="getI18nRoute({ name: 'setlist-form-edit', params: { id: setlist._id }})") {{ $t('setlistPage.edit') }}
  //- Content
  section.q-mx-auto.padding.q-mt-lg
    .container
      //- Information
      .row.q-col-gutter-y-lg
        //- Setlist info list
        .col-12
          q-list
            //- List header
            q-item-label.text-h6.text-tech(header) {{ $t('setlistPage.basic.title') }}
            q-separator.q-mb-md(inset)
          .row.q-col-gutter-md
            //- List items - Submitted by
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="upload")
                q-item-section
                  q-item-label {{ $t('setlistPage.basic.submittedBy.label') }}
                  q-item-label(caption)
                    //- NOTE:
                    //- v-if is a workaround here to prevent error
                    //- When go to edit page, prefetch function clears setlist data
                    //- This will make setlist._id empty, and cause router error: Missing required param "id"
                    //- Edit (Prefetch, clear data) --> Setlist(onUnmounted, error)
                    template(v-if="setlist.submitter._id.length > 0")
                      router-link.no-underline(:to="getI18nRoute({ name: 'profile-setlists', params: { id: setlist.submitter._id}})") {{ setlist.submitter.name }}
            //- List items - Rating
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="thumb_up_alt")
                q-item-section
                  q-item-label
                    q-rating(:model-value="setlist.rating?.avg || 0" readonly icon="star" icon-half="star_half" size='xs')
                  q-item-label(caption)
                    | {{ setlist.rating?.avg?.toFixed(2) || '' }} / {{ $t('setlistPage.basic.comments.count', {count: setlist.rating.count}) }}
            //- List items - Submitted at
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="calendar_month")
                q-item-section
                  q-item-label {{ $t('setlistPage.basic.submittedAt.label') }}
                  q-item-label(caption)
                    | {{ date.toLocaleString(setlist.createdAt) }}
                    | &nbsp;
                    | ({{ date.toRelative(setlist.createdAt) }})
            //- List items - Updated at
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="update")
                q-item-section
                  q-item-label {{ $t('setlistPage.basic.updatedAt.label') }}
                  q-item-label(caption)
                    | {{ date.toLocaleString(setlist.updatedAt) }}
                    | &nbsp;
                    | ({{ date.toRelative(setlist.updatedAt) }})
            //- List items - Control
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(:name="getControlIcon(setlist.control)")
                q-item-section
                  q-item-label {{ $t('setlistPage.basic.control.label') }}
                  q-item-label(caption)
                    | {{ $t('setlistPage.basic.control.' + controls[setlist.control]) }}
            //- List items - Patterns
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="music_note")
                q-item-section
                  q-item-label {{ $t('setlistPage.basic.patterns.label') }}
                  q-item-label(caption)
                    | {{ setlist.selectablePatterns.length }} + {{ setlist.hiddenPatterns.length }}
        //- Description
        //- NOTE:
        //- Use q-no-ssr to prevent hydration error
        .col-12.pre-line
          q-no-ssr
            q-list
              q-item-label.text-h6.text-tech(header) {{ $t('setlistPage.description.title') }}
              q-separator.q-mb-md(inset)
              q-item
                q-item-section
                  p(v-html="descriptionSanitized" v-if="setlist.description")
                  p(v-else) {{ $t('setlistPage.description.noDescription') }}
        //- Selectable Patterns
        .col-12.pre-line
          q-list
            q-item-label.text-h6.text-tech(header) {{ $t('setlistPage.selectablePatterns.title') }}
            q-separator.q-mb-md(inset)
          .row.justify-center.q-col-gutter-md
            .col-12.col-sm-6.col-md-4.col-lg-3(v-for="(pattern, idx) in setlist.selectablePatterns" :key="idx")
              SetlistPatternCard(:pattern="pattern" :last="idx === setlist.selectablePatterns.length - 1" type="selectable")
        //- Hidden Patterns
        .col-12.pre-line
          q-list
            q-item-label.text-h6.text-tech(header) {{ $t('setlistPage.hiddenPatterns.title') }}
            q-separator.q-mb-md(inset)
          .row.justify-center.q-col-gutter-md
            .col-12.col-sm-6.col-md-4.col-lg-3(v-for="(pattern, idx) in setlist.hiddenPatterns" :key="idx")
              SetlistPatternCard(:pattern="pattern" :last="idx === setlist.hiddenPatterns.length - 1" type="hidden")
        .col-12
          q-list
            q-item-label.text-h6.text-tech(header) {{ $t('setlistPage.previews.title') }}
            q-separator.q-mb-md(inset)
          .row.justify-center.q-col-gutter-md
            .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in setlist.previews" :key="idx")
              YoutubeVideo(:ytid="video.ytid" :name="video.name")
              p.text-center.q-mt-md {{ video.name }}
            p.text-center(v-if='setlist.previews.length === 0') {{ $t('setlistPage.previews.noPreview') }}
      //- Comments
      CommentList(type="setlist" :id="setlist._id" v-if="setlist._id.length > 0")
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
import SetlistPatternCard from '@/components/SetlistPatternCard.vue'
import YoutubeVideo from '@/components/YoutubeVideo.vue'
import { useLocalePath } from '@/composables/useLocalePath'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { getI18nRoute } from '@/i18n'
import { EMPTY_SETLIST, setlistQuery } from '@/queries/setlist'
import { useUserStore } from '@/stores/user'
import { controls, getControlIcon } from '@/utils/control'
import * as date from '@/utils/date'
import { toImageProxyUrl } from '@/utils/image'
import { toBreadcrumbList, toCreativeWork } from '@/utils/jsonLd'
import { prefetchById } from '@/utils/prefetch'
import { toAbsoluteUrl } from '@/utils/url'
import { getYouTubeThumbnail } from '@/utils/youtube'

const { t } = useI18n()
const route = useRoute('setlist')
const user = useUserStore()
const pathOf = useLocalePath()
// preFetch has already filled this entry in, so nothing is fetched twice
const { data } = useQuery(() => setlistQuery(route.params.id))
const setlist = computed(() => data.value ?? EMPTY_SETLIST)

const isImageError = ref(false)

const descriptionSanitized = computed(() => {
  return sanitizeHtml(setlist.value.description)
})

const backgroundImage = computed(() => {
  if (setlist.value.image?.length > 0 && !isImageError.value) {
    return toImageProxyUrl('setlists', setlist.value._id)
  } else if (setlist.value.previews?.length > 0) {
    return getYouTubeThumbnail(setlist.value.previews[0]!.ytid)
  } else {
    return toAbsoluteUrl('/assets/header-setlist.png')
  }
})

const onImageError = () => {
  isImageError.value = true
}

const description = computed(() =>
  t('setlistPage.meta.description', { submitter: setlist.value.submitter.name }),
)

useSeoMeta({
  title: () => t('setlistPage.meta.title', { name: setlist.value.name }),
  description,
  image: backgroundImage,
  type: 'article',
  // Only once the document has loaded: the placeholder has no ids to link to
  jsonLd: () =>
    data.value && [
      toCreativeWork({
        ...setlist.value,
        description: description.value,
        image: backgroundImage.value,
        path: route.path,
        submitter: {
          name: setlist.value.submitter.name,
          path: pathOf({ name: 'profile-setlists', params: { id: setlist.value.submitter._id } }),
        },
      }),
      toBreadcrumbList([
        { name: 'TECHMANIA', path: pathOf({ name: 'index' }) },
        { name: t('nav.setlists'), path: pathOf({ name: 'setlists' }) },
        { name: setlist.value.name, path: route.path },
      ]),
    ],
})

defineOptions({
  async preFetch({ currentRoute, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<RouteNamedMap, 'setlist'>
    await prefetchById({ currentRoute, store }, route.params.id, setlistQuery)
  },
})
</script>

<route lang="yaml">
name: setlist
meta:
  login: false
</route>
