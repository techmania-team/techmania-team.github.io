import type { SKINTYPE } from '@/utils/skin'

export interface ISkinSubmitter {
  _id: string
  name: string
}

export interface ISkinPreview {
  _id?: string
  name: string
  ytid: string
}

export interface ISkinRating {
  count: number
  avg: number
}

export interface ISkin {
  _id: string
  submitter: ISkinSubmitter
  name: string
  type: SKINTYPE[]
  link: string
  previews: ISkinPreview[]
  description: string
  image: string
  createdAt: string
  updatedAt: string
  rating: ISkinRating
}

export type ISkinSortBy = 'createdAt' | 'updatedAt' | 'name' | 'rating'

export interface ISkinSearchParams {
  start?: number
  limit?: number
  keywords?: string
  types?: string
  sortBy?: ISkinSortBy
  sort?: 1 | -1
  submitter?: string
}

export interface ISkinForm {
  name: string
  link: string
  image?: string
  previews?: ISkinPreview[]
  type: SKINTYPE[]
  description?: string
  'cf-turnstile-response': string
}

export interface ISkinSearchForm {
  keywords: string
  types: SKINTYPE[]
  sort: 1 | -1
  sortBy: ISkinSortBy
}
