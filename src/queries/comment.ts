import type { IComment, ICommentDetailed } from '@/types/comment'
import { defineInfiniteQueryOptions, defineQueryOptions } from '@pinia/colada'
import { AxiosError } from 'axios'
import * as commentService from '@/services/comment'
import { PAGE_SIZE } from './pattern'

/** The three things a comment can be attached to */
export type CommentTarget = 'pattern' | 'setlist' | 'skin'

export interface CommentQueryParams {
  target: CommentTarget
  id: string
}

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
export const commentsQuery = defineQueryOptions(({ target, id }: CommentQueryParams) => ({
  key: ['comments', target, id],
  query: async () => (await listByTarget[target](id)).data.result,
}))

/**
 * The signed-in user's own comment, which the API answers with a 404 when
 * they have not written one. That is an expected outcome here, not an error,
 * so it becomes `null` instead of putting the query into an error state.
 */
export const myCommentQuery = defineQueryOptions(({ target, id }: CommentQueryParams) => ({
  key: ['comments', 'mine', target, id],
  query: async (): Promise<IComment | null> => {
    try {
      return (await mineByTarget[target](id)).data.result
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) return null
      throw error
    }
  },
}))

/** Shape used before a comment exists, so templates never see undefined */
export const EMPTY_COMMENT: IComment = {
  _id: '',
  rating: 0,
  replies: [],
}

/** One user's comments across everything, for their profile tab */
export const commentsByUserQuery = defineInfiniteQueryOptions((user: string) => ({
  key: ['comments', 'by-user', user],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (await commentService.getByUser(user, { start: pageParam, limit: PAGE_SIZE })).data.result,
  // A short page means we reached the end
  getNextPageParam: (lastPage: ICommentDetailed[], _allPages, lastPageParam) =>
    lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined,
}))
