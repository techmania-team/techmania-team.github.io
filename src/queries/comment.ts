import type { IComment } from '@/types/comment'
import type { MaybeRefOrGetter } from 'vue'
import { AxiosError } from 'axios'
import { toValue } from 'vue'
import * as commentService from '@/services/comment'

/** The three things a comment can be attached to */
export type CommentTarget = 'pattern' | 'setlist' | 'skin'

const listByTarget = {
  pattern: commentService.getByPattern,
  setlist: commentService.getBySetlist,
  skin: commentService.getBySkin,
}

const mineByTarget = {
  pattern: commentService.getMyCommmentByPattern,
  setlist: commentService.getMyCommmentBySetlist,
  skin: commentService.getMyCommmentBySkin,
}

/** Everyone else's comments on one pattern, setlist or skin */
export const commentsQuery = (
  target: MaybeRefOrGetter<CommentTarget>,
  id: MaybeRefOrGetter<string>,
) => ({
  key: () => ['comments', toValue(target), toValue(id)],
  query: async () => (await listByTarget[toValue(target)](toValue(id))).data.result,
})

/**
 * The signed-in user's own comment, which the API answers with a 404 when
 * they have not written one. That is an expected outcome here, not an error,
 * so it becomes `null` instead of putting the query into an error state.
 */
export const myCommentQuery = (
  target: MaybeRefOrGetter<CommentTarget>,
  id: MaybeRefOrGetter<string>,
) => ({
  key: () => ['comments', 'mine', toValue(target), toValue(id)],
  query: async (): Promise<IComment | null> => {
    try {
      return (await mineByTarget[toValue(target)](toValue(id))).data.result
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) return null
      throw error
    }
  },
})

/** Shape used before a comment exists, so templates never see undefined */
export const EMPTY_COMMENT: IComment = {
  _id: '',
  rating: 0,
  replies: [],
}
