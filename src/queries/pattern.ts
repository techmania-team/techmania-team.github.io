import type { IPattern } from '@/types/pattern'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { searchID } from '@/services/pattern'

/**
 * Shared query options so a page's preFetch hook and its useQuery() call end
 * up on the same cache entry. preFetch keeps doing the routing decisions
 * (invalid id, missing record, wrong owner) that useQuery has no answer for,
 * but the data itself now lives in the Pinia Colada cache instead of a store.
 */
export const patternQuery = (id: MaybeRefOrGetter<string>) => ({
  key: () => ['patterns', toValue(id)],
  query: async () => (await searchID(toValue(id))).data.result,
  staleTime: 1000 * 60,
})

/** Shape used while a query is pending, so templates never see undefined */
export const EMPTY_PATTERN: IPattern = {
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
}
