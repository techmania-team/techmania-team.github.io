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
  type: SKINTYPE
  link: string
  previews: ISkinPreview[]
  description: string
  image: string
  webhook: string
  createdAt: string
  updatedAt: string
  rating: ISkinRating
}

export interface ISkinSearchParams {
  start?: number
  limit?: number
  keywords?: string
  types?: SKINTYPE
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'rating'
  sort?: 1 | -1
  submitter?: string
}

export interface ISkinForm {
  name: string
  link: string
  image?: string
  previews?: ISkinPreview[]
  type: SKINTYPE
  description?: string
  agree: boolean
}
