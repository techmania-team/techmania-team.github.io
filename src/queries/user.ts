import type { IUSer } from '@/types/user'
import { defineQueryOptions } from '@pinia/colada'
import { searchID } from '@/services/user'

/** @see {@link import('./pattern').patternQuery} for why this is shared */
export const userQuery = defineQueryOptions((id: string) => ({
  key: ['users', id],
  query: async () => (await searchID(id)).data.result,
  staleTime: 1000 * 60,
}))

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
