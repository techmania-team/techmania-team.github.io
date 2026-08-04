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
  _id?: string
  pattern: string
  difficulty: string
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
  webhook: string
  createdAt: string
  updatedAt: string
  rating: ISetlistRating
}

export interface ISetlistSearchParams {
  start?: number
  limit?: number
  keysounded?: boolean
  keywords?: string
  controls?: CONTROLTYPE
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'rating'
  sort?: 1 | -1
  submitter?: string
}

export interface ISetlistForm {
  name: string
  link: string
  image?: string
  control: CONTROLTYPE
  selectablePatterns?: ISetlistSelectablePattern[]
  hiddenPatterns?: ISetlistHiddenPattern[]
  previews?: ISetlistPreview[]
  description?: string
}
