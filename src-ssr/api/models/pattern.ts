import type { HydratedDocument, Model, Types } from 'mongoose'
import mongoose, { model, Schema } from 'mongoose'
import { CONTROLTYPE } from '@/utils/control'

export interface IPatternDifficulty {
  _id?: Types.ObjectId
  name: string
  level: number
  control: CONTROLTYPE
  lanes: 2 | 3 | 4
}

export interface IPatternPreview {
  name: string
  ytid: string
}

export interface IPattern {
  _id: Types.ObjectId
  submitter: Types.ObjectId
  name: string
  composer: string
  keysounded: boolean
  difficulties: Types.DocumentArray<IPatternDifficulty>
  link: string
  previews: Types.DocumentArray<IPatternPreview>
  description: string
  image: string
  webhook: string
  createdAt: Date
  updatedAt: Date
}

export type TPatternDocument = HydratedDocument<IPattern>

const difficultySchema = new Schema<IPatternDifficulty>({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  control: {
    type: Number,
    required: true,
    enum: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM],
  },
  lanes: {
    type: Number,
    required: true,
    min: 2,
    max: 4,
  },
})

const schema = new Schema<IPattern>(
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
    composer: {
      type: String,
      required: true,
    },
    keysounded: {
      type: Boolean,
      required: true,
    },
    difficulties: {
      type: [difficultySchema],
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
    webhook: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
)

// Create indexes for searching
schema.index({ name: 'text', composer: 'text', description: 'text' })
schema.index({ submitter: 1 })
// Create index for setlist searching
schema.index({ 'difficulties._id': 1 })

const Pattern: Model<IPattern> = mongoose.models.patterns || model<IPattern>('patterns', schema)

export default Pattern
