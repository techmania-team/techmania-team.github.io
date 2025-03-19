<template lang="pug">
q-page#skin
  //- Header
  q-parallax.header-parallax.header-blur(:height="200")
    //- Header image background
    template(#media)
      img(:src="backgroundImage")
    //- Header content
    template(#content)
      .column.items-center.q-mb-md
        .text-h4.text-center {{ skin.name }}
      .row.q-gutter-x-md
        q-btn(color="secondary" icon="download" :href="skin.link" target="__blank") {{ $t('pattern.download') }}
        q-btn(color="secondary" icon="edit" v-if="skin.submitter._id === user._id" :to="`/skins/${skin._id}/edit`") {{ $t('pattern.edit') }}
  //- Content
  section.q-mx-auto.padding.q-mt-lg
    .container
      //- Information
      .row.q-gutter-y-lg
        //- Skin info list
        .col-12
          q-list
            //- List header
            q-item-label.text-h6.text-tech(header) {{ $t('skin.skinData') }}
            q-separator.q-mb-md(inset)
            //- List items - Submitted by
            q-item
              q-item-section(avatar)
                q-icon(name="upload")
              q-item-section
                q-item-label {{ $t('pattern.submittedBy') }}
                q-item-label(caption)
                  router-link.no-underline(:to='`/users/${skin.submitter._id}/skins`') {{ skin.submitter.name }}
            //- List items - Type
            q-item
              q-item-section(avatar)
                q-icon(name="color_lens")
              q-item-section
                q-item-label {{ $t('submitSkinForm.skinType') }}
                q-item-label(caption)
                  | {{ $t('skin.' + types[skin.type]) }}
            //- List items - Rating
            q-item
              q-item-section(avatar)
                q-icon(name="thumb_up_alt")
              q-item-section
                q-item-label
                  q-rating(:model-value="skin.rating?.avg || 0" readonly icon="star" icon-half="star_half" size='xs')
                q-item-label(caption)
                  | {{ skin.rating?.avg?.toFixed(2) || '' }} / {{ $t('pattern.ratingCount', {count: skin.rating.count}) }}
        //- Description
        //- NOTE:
        //- Use q-no-ssr to prevent hydration error
        .col-12.pre-line
          q-no-ssr
            q-list
              q-item-label.text-h6.text-tech(header) {{ $t('skin.description') }}
              q-separator.q-mb-md(inset)
              q-item
                q-item-section
                  p(v-html="skin.description" v-if="skin.description")
                  p(v-else) {{ $t('pattern.noDescription') }}
        //- Previews
        .col-12
          q-list
            q-item-label.text-h6.text-tech(header) {{ $t('pattern.previews') }}
            q-separator.q-mb-md(inset)
          .row.justify-center.q-gutter-y-sm
            .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in skin.previews" :key="idx")
              q-video(:ratio="16/9" :src="'https://www.youtube.com/embed/'+video.ytid")
            p.text-center(v-if='skin.previews.length === 0') {{ $t('pattern.noPreview') }}
      //- Comments
      CommentList(type="skin" :id="skin._id" v-if="skin._id.length > 0")
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import validator from 'validator'
import { useUserStore } from 'src/stores/user'
import { useTempSkinStore } from 'src/stores/temp-skin'
import { getYouTubeThumbnail } from 'src/utils/youtube'
import { types } from 'src/utils/skin'
import CommentList from 'src/components/CommentList.vue'

const route = useRoute()
const user = useUserStore()
const skin = useTempSkinStore()

const backgroundImage = computed(() => {
  return skin.image?.length > 0
    ? skin.image
    : skin.previews.length > 0
      ? getYouTubeThumbnail(skin.previews[0].ytid)
      : '/assets/header-skin.png'
})

const metaData = () => ({
  title: `TECHMANIA | ${skin.name}`,
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: `${skin.name}`,
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: `Submitted by ${skin.submitter.name}.`,
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
      content: `TECHMANIA | ${skin.name}`,
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: `Submitted by ${skin.submitter.name}.`,
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
      content: `TECHMANIA | ${skin.name}`,
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: `Submitted by ${skin.submitter.name}.`,
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
    // Prefetch skin data
    const skin = useTempSkinStore()
    skin.clearData()

    if (!currentRoute.params.id || !validator.isMongoId(currentRoute.params.id)) {
      redirect('/404')
    }

    await skin.fetchSkin(currentRoute.params.id)

    // Check if skin exists and user is the submitter
    if (skin._id.length === 0) {
      redirect('/404')
    }
  },
})

onUnmounted(() => {
  // NOTE:
  // When going to skin edit page
  // Clear skin data when unmounting will cause skin edit page to lose data
  // Edit (Prefetch) --> Skin(onUnmounted) --> Edit (onMounted)
  // skin.clearData()
})
</script>
