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
  webhook: string
  createdAt: string
  updatedAt: string
  rating: IPatternRating
}

export interface IPatternSearchParams {
  start?: number
  limit?: number
  keysounded?: boolean
  keywords?: string
  controls?: CONTROLTYPE
  lanes?: 2 | 3 | 4
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'rating'
  sort?: 1 | -1
  submitter?: string
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
