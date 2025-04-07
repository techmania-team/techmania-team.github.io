<template lang="pug">
q-page#setlist
  //- Header
  q-parallax.header-parallax(:height="200")
    //- Header image background
    template(#media)
      img(:src="backgroundImage")
    //- Header content
    template(#content)
      .column.items-center.q-mb-md
        .text-h4.text-center {{ setlist.name }}
      .row.q-gutter-x-md
        q-btn(color="secondary" icon="download" :href="setlist.link" target="__blank") {{ $t('setlistPage.download') }}
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
                      router-link.no-underline(:to="getI18nRoute({ name: 'profile', params: { tab: 'setlists', id: setlist.submitter._id}})") {{ setlist.submitter.name }}
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
                  p(v-html="setlist.description" v-if="setlist.description")
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
              q-video(:ratio="16/9" :src="'https://www.youtube.com/embed/'+video.ytid")
              p.text-center.q-mt-md {{ video.name }}
            p.text-center(v-if='setlist.previews.length === 0') {{ $t('setlistPage.previews.noPreview') }}
      //- Comments
      CommentList(type="setlist" :id="setlist._id" v-if="setlist._id.length > 0")
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import validator from 'validator'
import { useUserStore } from 'src/stores/user'
import { useTempSetlistStore } from 'src/stores/temp-setlist'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import CommentList from 'src/components/CommentList.vue'
import { getI18nRoute } from 'src/i18n'
import * as date from 'src/utils/date'
import SetlistPatternCard from 'src/components/SetlistPatternCard.vue'
import { controls, getControlIcon } from 'src/utils/control'

const route = useRoute()
const user = useUserStore()
const setlist = useTempSetlistStore()

const backgroundImage = computed(() => {
  return setlist.image?.length > 0
    ? setlist.image
    : setlist.previews.length > 0
      ? getYouTubeThumbnail(setlist.previews[0].ytid)
      : '/assets/header-setlist.png'
})

const metaData = () => ({
  title: `TECHMANIA | ${setlist.name}`,
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: `${setlist.name}`,
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: `Submitted by ${setlist.submitter.name}.`,
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
      content: `TECHMANIA | ${setlist.name}`,
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: `Submitted by ${setlist.submitter.name}.`,
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
      content: `TECHMANIA | ${setlist.name}`,
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: `Submitted by ${setlist.submitter.name}.`,
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
    // Prefetch setlist data
    const setlist = useTempSetlistStore()
    setlist.clearData()

    if (!currentRoute.params.id || !validator.isMongoId(currentRoute.params.id)) {
      redirect('/404')
    }

    await setlist.fetchSetlist(currentRoute.params.id)

    // Check if setlist exists and user is the submitter
    if (setlist._id.length === 0) {
      redirect('/404')
    }
  },
})

onUnmounted(() => {
  // NOTE:
  // When going to setlist edit page
  // Clear setlist data when unmounting will cause setlist edit page to lose data
  // Edit (Prefetch) --> Setlist(onUnmounted) --> Edit (onMounted)
  // setlist.clearData()
})
</script>
