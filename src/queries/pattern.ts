import type { IPattern, IPatternSearchForm } from '@/types/pattern'
import { defineInfiniteQueryOptions, defineQueryOptions } from '@pinia/colada'
import { search, searchID } from '@/services/pattern'

/** How many rows one page of an infinite list holds */
export const PAGE_SIZE = 12

/** A short page means we reached the end */
const nextStart = (lastPage: unknown[], lastPageParam: number) =>
  lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined

/**
 * The pattern list. The search parameters are part of the key, so every
 * distinct search keeps its own pages and going back to a previous one is
 * instant.
 */
export const patternSearchQuery = defineInfiniteQueryOptions((params: IPatternSearchForm) => ({
  key: ['patterns', 'search', params],
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await search({
        start: pageParam,
        keysounded: params.keysounded,
        controls: params.controls.join(),
        keywords: params.keywords,
        lanes: params.lanes.join(),
        sort: params.sort,
        sortBy: params.sortBy,
        limit: PAGE_SIZE,
      })
    ).data.result,
  getNextPageParam: (lastPage: IPattern[], _allPages, lastPageParam) =>
    nextStart(lastPage, lastPageParam),
}))

/** One submitter's patterns, newest first, for their profile tab */
export const patternsByUserQuery = defineInfiniteQueryOptions((submitter: string) => ({
  key: ['patterns', 'by-user', submitter],
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
  getNextPageParam: (lastPage: IPattern[], _allPages, lastPageParam) =>
    nextStart(lastPage, lastPageParam),
}))

/**
 * Shared query options so a page's preFetch hook and its useQuery() call end
 * up on the same cache entry. preFetch keeps making the routing decisions
 * (invalid id, missing record, wrong owner) that useQuery has no answer for,
 * but the data itself lives in the Pinia Colada cache.
 *
 * defineQueryOptions only takes static values, so pass the id in from a
 * getter at the call site: useQuery(() => patternQuery(route.params.id)).
 */
export const patternQuery = defineQueryOptions((id: string) => ({
  key: ['patterns', id],
  query: async () => (await searchID(id)).data.result,
}))

/**
 * Name lookup used by the setlist form's pattern picker. Cached so that
 * backspacing through a search term does not refetch what was just typed.
 */
export const patternTypeaheadQuery = defineQueryOptions((keywords: string) => ({
  key: ['patterns', 'typeahead', keywords],
  query: async () =>
    (await search({ keywords, sort: 1 as const, sortBy: 'name' as const })).data.result,
}))

/** Shape used while a query is pending, so templates never see undefined */
export const EMPTY_PATTERN: Readonly<IPattern> = Object.freeze({
  _id: '',
  submitter: { _id: '', name: '' },
  name: '',
  composer: '',
  keysounded: false,
  difficulties: [],
  link: '',
  previews: [],
  description: '',
  image: '',
  createdAt: '',
  updatedAt: '',
  rating: { count: 0, avg: 0 },
})
