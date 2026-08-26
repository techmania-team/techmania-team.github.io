import type { IPatternDifficulty, IPatternPreview, IPatternSubmitter } from './pattern'
import type { CONTROLTYPE } from '@/utils/control'
import type { CRITERIA, CRITERIA_DIRECTION } from '@/utils/criteria'

export interface ISetlistSubmitter {
  _id: string
  name: string
}

export interface ISetlistPreview {
  _id?: string
  name: string
  ytid: string
}

export interface ISetlistSelectablePattern {
  _id: string
  pattern: string
  submitter: IPatternSubmitter
  name: string
  composer: string
  keysounded: boolean
  link: string
  previews: IPatternPreview[]
  description: string
  image: string
  createdAt: string
  updatedAt: string
  difficulty: IPatternDifficulty
}
export interface ISetlistHiddenPattern extends ISetlistSelectablePattern {
  criteriaType: CRITERIA
  criteriaDirection: CRITERIA_DIRECTION
  criteriaValue: number
}

export interface ISetlistRating {
  count: number
  avg: number
}

export interface ISetlist {
  _id: string
  submitter: ISetlistSubmitter
  name: string
  link: string
  previews: ISetlistPreview[]
  description: string
  image: string
  control: CONTROLTYPE
  selectablePatterns: ISetlistSelectablePattern[]
  hiddenPatterns: ISetlistHiddenPattern[]
  createdAt: string
  updatedAt: string
  rating: ISetlistRating
}

export type ISetlistSortBy = 'createdAt' | 'updatedAt' | 'name' | 'rating'
export interface ISetlistSearchParams {
  start?: number
  limit?: number
  keysounded?: boolean
  keywords?: string
  controls?: string
  sortBy?: ISetlistSortBy
  sort?: 1 | -1
  submitter?: string
}

export interface ISetlistFormSelectablePattern {
  pattern: string
  difficulty: string
}

export interface ISetlistFormHiddenPattern extends ISetlistFormSelectablePattern {
  criteriaType: number
  criteriaDirection: number
  criteriaValue: number
}

export interface ISetlistForm {
  name: string
  link: string
  image?: string
  control: CONTROLTYPE
  selectablePatterns?: ISetlistFormSelectablePattern[]
  hiddenPatterns?: ISetlistFormHiddenPattern[]
  previews?: ISetlistPreview[]
  description?: string
  'cf-turnstile-response': string
}

export interface ISetlistSearchForm {
  keywords: string
  controls: number[]
  sort: 1 | -1
  sortBy: ISetlistSortBy
}
