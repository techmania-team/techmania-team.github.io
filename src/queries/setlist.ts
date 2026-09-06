import type { ISetlist, ISetlistSearchForm } from '@/types/setlist'
import { defineInfiniteQueryOptions, defineQueryOptions } from '@pinia/colada'
import { search, searchID } from '@/services/setlist'
import { CONTROLTYPE } from '@/utils/control'
import { PAGE_SIZE } from './pattern'

/** A short page means we reached the end */
const nextStart = (lastPage: unknown[], lastPageParam: number) =>
  lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined

/** @see {@link import('./pattern').patternSearchQuery} */
export const setlistSearchQuery = defineInfiniteQueryOptions((params: ISetlistSearchForm) => ({
  key: ['setlists', 'search', params],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await search({
        start: pageParam,
        keywords: params.keywords,
        controls: params.controls.join(),
        sort: params.sort,
        sortBy: params.sortBy,
        limit: PAGE_SIZE,
      })
    ).data.result,
  getNextPageParam: (lastPage: ISetlist[], _allPages, lastPageParam) =>
    nextStart(lastPage, lastPageParam),
}))

/** One submitter's setlists, newest first, for their profile tab */
export const setlistsByUserQuery = defineInfiniteQueryOptions((submitter: string) => ({
  key: ['setlists', 'by-user', submitter],
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
  getNextPageParam: (lastPage: ISetlist[], _allPages, lastPageParam) =>
    nextStart(lastPage, lastPageParam),
}))

/** @see {@link import('./pattern').patternQuery} for why this is shared */
export const setlistQuery = defineQueryOptions((id: string) => ({
  key: ['setlists', id],
  query: async () => (await searchID(id)).data.result,
}))

/** Shape used while a query is pending, so templates never see undefined */
export const EMPTY_SETLIST: Readonly<ISetlist> = Object.freeze({
  _id: '',
  submitter: { _id: '', name: '' },
  name: '',
  link: '',
  previews: [],
  description: '',
  image: '',
  control: CONTROLTYPE.TOUCH,
  selectablePatterns: [],
  hiddenPatterns: [],
  createdAt: '',
  updatedAt: '',
  rating: { count: 0, avg: 0 },
})
