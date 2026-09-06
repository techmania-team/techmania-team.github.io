import type { IUSer } from '@/types/user'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { searchID } from '@/services/user'

/** @see {@link import('./pattern').patternQuery} for why this is shared */
export const userQuery = (id: MaybeRefOrGetter<string>) => ({
  key: () => ['users', toValue(id)],
  query: async () => (await searchID(toValue(id))).data.result,
  staleTime: 1000 * 60,
})

/** Shape used while a query is pending, so templates never see undefined */
export const EMPTY_USER: IUSer = {
  _id: '',
  name: '',
  avatar: '',
  patternCount: 0,
  skinCount: 0,
  setlistCount: 0,
  commentCount: 0,
}
