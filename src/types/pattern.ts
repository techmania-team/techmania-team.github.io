import type { CONTROLTYPE } from '@/utils/control'

export interface IPatternSubmitter {
  _id: string
  name: string
}

export interface IPatternDifficulty {
  _id?: string
  name: string
  level: number
  control: CONTROLTYPE
  lanes: 2 | 3 | 4
}

export interface IPatternPreview {
  _id?: string
  name: string
  ytid: string
}

export interface IPatternRating {
  count: number
  avg: number
}

export interface IPattern {
  _id: string
  submitter: IPatternSubmitter
  name: string
  composer: string
  keysounded: boolean
  difficulties: IPatternDifficulty[]
  link: string
  previews: IPatternPreview[]
  description: string
  image: string
  createdAt: string
  updatedAt: string
  rating: IPatternRating
}

export type IPatternSortBy = 'createdAt' | 'updatedAt' | 'name' | 'rating'

export interface IPatternSearchParams {
  start?: number
  limit?: number
  keysounded?: boolean | undefined
  keywords?: string
  controls?: string
  lanes?: string
  sortBy?: IPatternSortBy
  sort?: 1 | -1
  submitter?: string
}

export interface IPatternSearchForm {
  keywords: string
  keysounded: boolean | undefined
  controls: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM]
  lanes: (2 | 3 | 4)[]
  sort: 1 | -1
  sortBy: IPatternSortBy
}

export interface IPatternForm {
  name: string
  composer: string
  link: string
  keysounded: boolean
  image?: string
  previews?: IPatternPreview[]
  difficulties?: IPatternDifficulty[]
  description?: string
}
