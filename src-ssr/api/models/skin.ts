import type { HydratedDocument, Model, Types } from 'mongoose'
import mongoose, { model, Schema } from 'mongoose'
import { SKINTYPE } from '@/utils/skin'

export interface ISkinPreview {
  name: string
  ytid: string
}

export interface ISkin {
  _id: Types.ObjectId
  submitter: Types.ObjectId
  name: string
  type: SKINTYPE[]
  link: string
  previews: Types.DocumentArray<ISkinPreview>
  description: string
  image: string
  webhook: string
  createdAt: Date
  updatedAt: Date
}

export type TSkinDocument = HydratedDocument<ISkin>

const schema = new Schema<ISkin>(
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
    type: {
      type: [
        {
          type: Number,
          enum: [SKINTYPE.NOTE, SKINTYPE.VFX, SKINTYPE.COMBO, SKINTYPE.GAMEUI, SKINTYPE.THEME],
        },
      ],
      required: true,
      enum: [SKINTYPE.NOTE, SKINTYPE.VFX, SKINTYPE.COMBO, SKINTYPE.GAMEUI, SKINTYPE.THEME],
      validate: [
        (val: number[]) => Array.isArray(val) && val.length > 0,
        'Skin must have at least one type',
      ],
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
schema.index({ name: 'text', description: 'text' })
schema.index({ submitter: 1 })

const Skin: Model<ISkin> = mongoose.models.skins || model<ISkin>('skins', schema)

export default Skin
