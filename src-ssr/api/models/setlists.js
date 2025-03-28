import mongoose from 'mongoose'
import { CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM } from 'src/utils/control'
import {
  CRITERIA_INDEX,
  CRITERIA_LEVEL,
  CRITERIA_HP,
  CRITERIA_SCORE,
  CRITERIA_COMBO,
  CRITERIA_MAX_COMBO,
  CRITERIA_D100,
  CRITERIA_NONE,
  CRITERIA_DIRECTION_LOWER,
  CRITERIA_DIRECTION_GREATER,
} from 'src/utils/criteria'

const schema = new mongoose.Schema(
  {
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
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
      enum: [CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM],
    },
    selectablePatterns: {
      type: [
        {
          pattern: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'pattern',
            required: true,
          },
          difficulty: {
            type: mongoose.Schema.Types.ObjectId,
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'pattern',
            required: true,
          },
          difficulty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'pattern.difficulties',
            required: true,
          },
          criteriaType: {
            type: Number,
            required: true,
            enums: [
              CRITERIA_INDEX,
              CRITERIA_LEVEL,
              CRITERIA_HP,
              CRITERIA_SCORE,
              CRITERIA_COMBO,
              CRITERIA_MAX_COMBO,
              CRITERIA_D100,
              CRITERIA_NONE,
            ],
          },
          criteriaDirection: {
            type: Number,
            required: true,
            enums: [CRITERIA_DIRECTION_LOWER, CRITERIA_DIRECTION_GREATER],
          },
          criteriaValue: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  { versionKey: false, timestamps: true },
)

// Create indexes for searching
schema.index({ name: 'text', description: 'text' })
schema.index({ submitter: 1 })

export default mongoose.models.setlists || mongoose.model('setlists', schema)
