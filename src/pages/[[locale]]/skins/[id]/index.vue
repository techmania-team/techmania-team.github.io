<template lang="pug">
q-page#skin
  //- Header
  q-parallax.header-parallax(:height="200")
    //- Header image background
    template(#media)
      q-img(:src="backgroundImage" @error="onImageError")
    //- Header content
    template(#content)
      .column.items-center.q-mb-md
        .text-h4.text-center {{ skin.name }}
      .row.q-gutter-x-md
        q-btn(color="secondary" icon="download" :href="skin.link" target="__blank" rel="noopener noreferrer") {{ $t('skinPage.download') }}
        q-btn(color="secondary" icon="edit" v-if="skin.submitter._id === user._id" :to="getI18nRoute({ name: 'skin-form-edit', params: { id: skin._id }})") {{ $t('skinPage.edit') }}
  //- Content
  section.q-mx-auto.padding.q-mt-lg
    .container
      //- Information
      .row.q-col-gutter-y-lg
        //- Skin info list
        .col-12
          q-list
            //- List header
            q-item-label.text-h6.text-tech(header) {{ $t('skinPage.basic.title') }}
            q-separator.q-mb-md(inset)
          .row.q-col-gutter-md
            //- List items - Submitted by
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="upload")
                q-item-section
                  q-item-label {{ $t('skinPage.basic.submittedBy.label') }}
                  q-item-label(caption)
                    //- NOTE:
                    //- v-if is a workaround here to prevent error
                    //- When go to edit page, prefetch function clears skin data
                    //- This will make skin._id empty, and cause router error: Missing required param "id"
                    //- Edit (Prefetch, clear data) --> Skin(onUnmounted, error)
                    template(v-if="skin.submitter._id.length > 0")
                      router-link.no-underline(:to="getI18nRoute({ name: 'profile-skins', params: { id: skin.submitter._id}})") {{ skin.submitter.name }}
            //- List items - Rating
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="thumb_up_alt")
                q-item-section
                  q-item-label
                    q-rating(:model-value="skin.rating?.avg || 0" readonly icon="star" icon-half="star_half" size='xs')
                  q-item-label(caption)
                    | {{ skin.rating?.avg?.toFixed(2) || '' }} / {{ $t('skinPage.basic.comments.count', {count: skin.rating.count}) }}
            //- List items - Submitted at
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="calendar_month")
                q-item-section
                  q-item-label {{ $t('skinPage.basic.submittedAt.label') }}
                  q-item-label(caption)
                    | {{ date.toLocaleString(skin.createdAt) }}
                    | &nbsp;
                    | ({{ date.toRelative(skin.createdAt) }})
            //- List items - Updated at
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="update")
                q-item-section
                  q-item-label {{ $t('skinPage.basic.updatedAt.label') }}
                  q-item-label(caption)
                    | {{ date.toLocaleString(skin.updatedAt) }}
                    | &nbsp;
                    | ({{ date.toRelative(skin.updatedAt) }})
            //- List items - Type
            .col-12.col-md-6
              q-item
                q-item-section(avatar)
                  q-icon(name="color_lens")
                q-item-section
                  q-item-label {{ $t('skinPage.basic.type.label') }}
                  q-item-label(caption)
                    | {{ (Array.isArray(skin.type) ? skin.type : [skin.type]).map((t) => $t('skinPage.basic.type.' + SKINTYPES[t])).join(', ') }}
        //- Description
        //- NOTE:
        //- Use q-no-ssr to prevent hydration error
        .col-12.pre-line
          q-no-ssr
            q-list
              q-item-label.text-h6.text-tech(header) {{ $t('skinPage.description.title') }}
              q-separator.q-mb-md(inset)
              q-item
                q-item-section
                  p(v-html="descriptionSanitized" v-if="skin.description")
                  p(v-else) {{ $t('skinPage.description.noDescription') }}
        //- Previews
        .col-12
          q-list
            q-item-label.text-h6.text-tech(header) {{ $t('skinPage.previews.title') }}
            q-separator.q-mb-md(inset)
          .row.justify-center.q-col-gutter-md
            .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in skin.previews" :key="idx")
              YoutubeVideo(:ytid="video.ytid" :name="video.name")
              p.text-center.q-mt-md {{ video.name }}
            p.text-center(v-if='skin.previews.length === 0') {{ $t('skinPage.previews.noPreview') }}
      //- Comments
      CommentList(type="skin" :id="skin._id" v-if="skin._id.length > 0")
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
import { EMPTY_SKIN, skinQuery } from '@/queries/skin'
import { useUserStore } from '@/stores/user'
import * as date from '@/utils/date'
import { toImageProxyUrl } from '@/utils/image'
import { toBreadcrumbList, toCreativeWork } from '@/utils/jsonLd'
import { prefetchById } from '@/utils/prefetch'
import { SKINTYPES } from '@/utils/skin'
import { toAbsoluteUrl } from '@/utils/url'
import { getYouTubeThumbnail } from '@/utils/youtube'

const { t } = useI18n()
const route = useRoute('skin')
const user = useUserStore()
const pathOf = useLocalePath()
// preFetch has already filled this entry in, so nothing is fetched twice
const { data } = useQuery(() => skinQuery(route.params.id))
const skin = computed(() => data.value ?? EMPTY_SKIN)

const isImageError = ref(false)

const descriptionSanitized = computed(() => {
  return sanitizeHtml(skin.value.description)
})

const backgroundImage = computed(() => {
  if (skin.value.image?.length > 0 && !isImageError.value) {
    return toImageProxyUrl('skins', skin.value._id)
  } else if (skin.value.previews?.length > 0) {
    return getYouTubeThumbnail(skin.value.previews[0]!.ytid)
  } else {
    return toAbsoluteUrl('/assets/header-skin.png')
  }
})

const onImageError = () => {
  isImageError.value = true
}

const description = computed(() =>
  t('skinPage.meta.description', { submitter: skin.value.submitter.name }),
)

useSeoMeta({
  title: () => t('skinPage.meta.title', { name: skin.value.name }),
  description,
  image: backgroundImage,
  type: 'article',
  // Only once the document has loaded: the placeholder has no ids to link to
  jsonLd: () =>
    data.value && [
      toCreativeWork({
        ...skin.value,
        description: description.value,
        image: backgroundImage.value,
        path: route.path,
        submitter: {
          name: skin.value.submitter.name,
          path: pathOf({ name: 'profile-skins', params: { id: skin.value.submitter._id } }),
        },
      }),
      toBreadcrumbList([
        { name: 'TECHMANIA', path: pathOf({ name: 'index' }) },
        { name: t('nav.skins'), path: pathOf({ name: 'skins' }) },
        { name: skin.value.name, path: route.path },
      ]),
    ],
})

defineOptions({
  async preFetch({ currentRoute, store }) {
    const route = currentRoute as RouteLocationNormalizedLoadedTyped<RouteNamedMap, 'skin'>
    await prefetchById({ currentRoute, store }, route.params.id, skinQuery)
  },
})
</script>

<route lang="yaml">
name: skin
meta:
  login: false
</route>
