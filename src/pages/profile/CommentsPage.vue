<template lang="pug">
#profile-comments
  .container
    .text-center.q-mt-md.text-body1(v-if="comments.length === 0 && scrollDisable") {{ $t('comment.noComment') }}
    q-infinite-scroll.row.q-my-md(v-else @load="loadScroll" :offset="200" :disable="scrollDisable")
      .col-12
        q-list(separator)
          //- Loop all comments
          q-item(v-for="(comment) in comments" :key="comment._id" clickable :to="getCommentLink(comment)")
            q-item-section.no-wrap
              .row.q-col-gutter-y-sm
                .col-12
                  .row.q-col-gutter-x-md.items-center
                    .col-auto
                      //- Icon
                      q-icon(v-if="comment.pattern" name="music_note" size="48px")
                      q-icon(v-else-if="comment.skin" name="stars" size="48px")
                    .col-auto
                      //- Pattern or Skin name
                      .text-h6.text-tech
                        span(v-if="comment.pattern") {{ comment.pattern.composer }} - {{ comment.pattern.name }}
                        span(v-else-if="comment.skin") {{ comment.skin.name }}
                      q-rating(v-model="comment.rating" readonly)
                .col-12
                  //- Comment
                  p.q-my-sm {{ comment.comment }}
                .col-12
                  //- Date
                  small.text-grey
                    | {{ date.toRelative(comment.updatedAt) }}
                    q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                      | {{ date.toLocaleString(comment.updatedAt) }}
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import handleError from 'src/utils/handleError'
import api from 'src/utils/api'
import * as date from 'src/utils/date'
import { getI18nRoute } from 'src/i18n'

const route = useRoute()

const comments = ref([])
const scrollDisable = ref(false)

const fetchComments = async (start = 0) => {
  try {
    const { data } = await api.get('/comments/user/' + route.params.id, {
      params: {
        submitter: route.params.id,
        start: start,
        sort: -1,
        sortBy: 'createdAt',
        limit: 12,
      },
    })

    if (data.result.length > 0) comments.value = comments.value.concat(data.result)
    else scrollDisable.value = true
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  }
}

const loadScroll = async (index, done) => {
  await fetchComments((index - 1) * 12)
  done()
}

const getCommentLink = (comment) => {
  if (comment.pattern) return getI18nRoute({ name: 'pattern', params: { id: comment.pattern._id } })
  else if (comment.skin) return getI18nRoute({ name: 'skin', params: { id: comment.pattern._id } })
}
</script>
