import type { HydratedDocument, Types } from 'mongoose'
import { model, Schema } from 'mongoose'
import { CONTROLTYPE } from '@/utils/control'
import { CRITERIA, CRITERIA_DIRECTION } from '@/utils/criteria'

export interface ISetlistPreview {
  name: string
  ytid: string
}

export interface ISetlistSelectablePattern {
  _id: Types.ObjectId
  pattern: Types.ObjectId
  difficulty: Types.ObjectId
}

export interface ISetlistHiddenPattern {
  _id: Types.ObjectId
  pattern: Types.ObjectId
  difficulty: Types.ObjectId
  criteriaType: CRITERIA
  criteriaDirection: CRITERIA_DIRECTION
  criteriaValue: number
}

export interface ISetlist {
  _id: Types.ObjectId
  submitter: Types.ObjectId
  name: string
  link: string
  previews: Types.DocumentArray<ISetlistPreview>
  description: string
  image: string
  control: CONTROLTYPE
  selectablePatterns: Types.DocumentArray<ISetlistSelectablePattern>
  hiddenPatterns: Types.DocumentArray<ISetlistHiddenPattern>
  webhook: string
  createdAt: Date
  updatedAt: Date
}

export type TSetlistDocument = HydratedDocument<ISetlist>

const schema = new Schema<ISetlist>(
  {
    submitter: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    name: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    previews: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          ytid: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: '',
    },
    control: {
      type: Number,
      required: true,
      enum: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM],
    },
    selectablePatterns: {
      type: [
        {
          pattern: {
            type: Schema.Types.ObjectId,
            ref: 'pattern',
            required: true,
          },
          difficulty: {
            type: Schema.Types.ObjectId,
            ref: 'pattern.difficulties',
            required: true,
          },
        },
      ],
      default: [],
    },
    hiddenPatterns: {
      type: [
        {
          pattern: {
            type: Schema.Types.ObjectId,
            ref: 'pattern',
            required: true,
          },
          difficulty: {
            type: Schema.Types.ObjectId,
            ref: 'pattern.difficulties',
            required: true,
          },
          criteriaType: {
            type: Number,
            required: true,
            enums: [
              CRITERIA.INDEX,
              CRITERIA.LEVEL,
              CRITERIA.HP,
              CRITERIA.SCORE,
              CRITERIA.COMBO,
              CRITERIA.MAX_COMBO,
              CRITERIA.D100,
              CRITERIA.NONE,
            ],
          },
          criteriaDirection: {
            type: Number,
            required: true,
            enums: [CRITERIA_DIRECTION.LOWER, CRITERIA_DIRECTION.GREATER],
          },
          criteriaValue: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
    webhook: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
)

// Create indexes for searching
schema.index({ name: 'text', description: 'text' })
schema.index({ submitter: 1 })
schema.index({ 'selectablePatterns.pattern': 1 })
schema.index({ 'hiddenPatterns.pattern': 1 })

export default model('setlists', schema)
