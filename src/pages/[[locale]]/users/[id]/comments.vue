<template lang="pug">
#profile-comments
  .container
    .text-center.q-mt-md.text-body1(v-if="!isPending && comments.length === 0") {{ $t('profile.comments.notFound') }}
    q-infinite-scroll.row.q-my-md(v-else @load="loadScroll" :offset="200" :disable="!hasNextPage")
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
                      q-icon(v-else-if="comment.setlist" name="list_alt" size="48px")
                    .col-auto
                      //- Pattern or Skin name
                      .text-h6.text-tech
                        span(v-if="comment.pattern") {{ comment.pattern.composer }} - {{ comment.pattern.name }}
                        span(v-else-if="comment.skin") {{ comment.skin.name }}
                        span(v-else-if="comment.setlist") {{ comment.setlist.name }}
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

<script setup lang="ts">
import type { ICommentDetailed } from '@/types/comment'
import { useInfiniteQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getI18nRoute } from '@/i18n'
import * as commentService from '@/services/comment'
import * as date from '@/utils/date'

const route = useRoute('profile-comments')

const PAGE_SIZE = 12

const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery({
  key: () => ['comments', 'by-user', route.params.id],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await commentService.getByUser(route.params.id, {
        start: pageParam,
        limit: PAGE_SIZE,
      })
    ).data.result,
  // A short page means we reached the end
  getNextPageParam: (lastPage: ICommentDetailed[], _allPages, lastPageParam) =>
    lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined,
})

const comments = computed(() => data.value?.pages.flat() ?? [])

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!hasNextPage.value) return done(true)
  // cancelRefetch: false makes a concurrent trigger await the request that is
  // already running. The default aborts it and starts a new one, which turns
  // repeated q-infinite-scroll triggers into a storm of cancelled requests.
  await loadNextPage({ cancelRefetch: false })
  done(!hasNextPage.value)
}

const getCommentLink = (comment: ICommentDetailed) => {
  if (comment.pattern) return getI18nRoute({ name: 'pattern', params: { id: comment.pattern._id } })
  else if (comment.skin) return getI18nRoute({ name: 'skin', params: { id: comment.skin._id } })
  else if (comment.setlist)
    return getI18nRoute({ name: 'setlist', params: { id: comment.setlist._id } })
}
</script>

<route lang="yaml">
name: profile-comments
meta:
  login: false
</route>
