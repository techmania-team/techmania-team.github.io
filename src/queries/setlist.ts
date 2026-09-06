import type { ISetlist } from '@/types/setlist'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { searchID } from '@/services/setlist'
import { CONTROLTYPE } from '@/utils/control'

/** @see {@link import('./pattern').patternQuery} for why this is shared */
export const setlistQuery = (id: MaybeRefOrGetter<string>) => ({
  key: () => ['setlists', toValue(id)],
  query: async () => (await searchID(toValue(id))).data.result,
  staleTime: 1000 * 60,
})

/** Shape used while a query is pending, so templates never see undefined */
export const EMPTY_SETLIST: ISetlist = {
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
}
