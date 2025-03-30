<template lang="pug">
q-page#pattern
  //- Header
  q-parallax.header-parallax(:height="200")
    //- Header image background
    template(#media)
      img(:src="backgroundImage")
    //- Header content
    template(#content)
      .column.items-center.q-mb-md
        .text-h4.text-center {{ pattern.name }}
        .text-h6.text-center {{ pattern.composer }}
      .row.q-gutter-md
        q-btn(color="secondary" icon="download" :href="pattern.link" target="__blank") {{ $t('patternPage.download') }}
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
                      router-link.no-underline(:to="getI18nRoute({ name: 'profile', params: { tab: 'patterns', id: pattern.submitter._id}})") {{ pattern.submitter.name }}
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
                      q-icon.text-black(size="sm" :name="getControlIcon(difficulty.control, difficulty.level)" :class="getLevelFilter(difficulty.level)")
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
                  p(v-html="pattern.description" v-if="pattern.description")
                  p(v-else) {{ $t('patternPage.description.noDescription') }}
        //- Previews
        .col-12
          q-list
            q-item-label.text-h6.text-tech(header) {{ $t('patternPage.previews.title') }}
            q-separator.q-mb-md(inset)
          .row.justify-center.q-col-gutter-md
            .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in pattern.previews" :key="idx")
              q-video(:ratio="16/9" :src="'https://www.youtube.com/embed/'+video.ytid")
            p.text-center(v-if='pattern.previews.length === 0') {{ $t('patternPage.previews.noPreview') }}
      //- Comments
      CommentList(type="pattern" :id="pattern._id" v-if="pattern._id.length > 0")
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import validator from 'validator'
import { useUserStore } from 'src/stores/user'
import { useTempPatternStore } from 'src/stores/temp-pattern'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import { getLevelFilter, getLevelColor } from 'src/utils/level'
import { getControlIcon } from 'src/utils/control'
import CommentList from 'src/components/CommentList.vue'
import { getI18nRoute } from 'src/i18n'
import * as date from 'src/utils/date'

const route = useRoute()
const user = useUserStore()
const pattern = useTempPatternStore()

const backgroundImage = computed(() => {
  return pattern.image?.length > 0
    ? pattern.image
    : pattern.previews.length > 0
      ? getYouTubeThumbnail(pattern.previews[0].ytid)
      : '/assets/header-pattern.png'
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
  async preFetch({ currentRoute, redirect }) {
    // Prefetch pattern data
    const pattern = useTempPatternStore()
    pattern.clearData()

    if (!currentRoute.params.id || !validator.isMongoId(currentRoute.params.id)) {
      redirect('/404')
    }

    await pattern.fetchPattern(currentRoute.params.id)

    // Check if pattern exists and user is the submitter
    if (pattern._id.length === 0) {
      redirect('/404')
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
