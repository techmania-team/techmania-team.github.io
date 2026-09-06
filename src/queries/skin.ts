import type { ISkin, ISkinSearchForm } from '@/types/skin'
import { defineInfiniteQueryOptions, defineQueryOptions } from '@pinia/colada'
import { search, searchID } from '@/services/skin'
import { PAGE_SIZE } from './pattern'

/** A short page means we reached the end */
const nextStart = (lastPage: unknown[], lastPageParam: number) =>
  lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined

/** @see {@link import('./pattern').patternSearchQuery} */
export const skinSearchQuery = defineInfiniteQueryOptions((params: ISkinSearchForm) => ({
  key: ['skins', 'search', params],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await search({
        start: pageParam,
        types: params.types.join(),
        keywords: params.keywords,
        sort: params.sort,
        sortBy: params.sortBy,
        limit: PAGE_SIZE,
      })
    ).data.result,
  getNextPageParam: (lastPage: ISkin[], _allPages, lastPageParam) =>
    nextStart(lastPage, lastPageParam),
}))

/** One submitter's skins, newest first, for their profile tab */
export const skinsByUserQuery = defineInfiniteQueryOptions((submitter: string) => ({
  key: ['skins', 'by-user', submitter],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await search({
        submitter,
        start: pageParam,
        sort: -1 as const,
        sortBy: 'createdAt' as const,
        limit: PAGE_SIZE,
      })
    ).data.result,
  getNextPageParam: (lastPage: ISkin[], _allPages, lastPageParam) =>
    nextStart(lastPage, lastPageParam),
}))

/** @see {@link import('./pattern').patternQuery} for why this is shared */
export const skinQuery = defineQueryOptions((id: string) => ({
  key: ['skins', id],
  query: async () => (await searchID(id)).data.result,
  staleTime: 1000 * 60,
}))

/** Shape used while a query is pending, so templates never see undefined */
export const EMPTY_SKIN: ISkin = {
  _id: '',
  submitter: { _id: '', name: '' },
  name: '',
  type: [],
  link: '',
  previews: [],
  description: '',
  image: '',
  createdAt: '',
  updatedAt: '',
  rating: { count: 0, avg: 0 },
}
