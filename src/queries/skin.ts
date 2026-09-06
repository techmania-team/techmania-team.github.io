import type { ISkin } from '@/types/skin'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { searchID } from '@/services/skin'

/** @see {@link import('./pattern').patternQuery} for why this is shared */
export const skinQuery = (id: MaybeRefOrGetter<string>) => ({
  key: () => ['skins', toValue(id)],
  query: async () => (await searchID(toValue(id))).data.result,
  staleTime: 1000 * 60,
})

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
