import mongoose from 'mongoose'
import { CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM } from 'src/utils/control'

const difficultySchema = new mongoose.Schema(
  {
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
      enum: [CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM],
    },
    lanes: {
      type: Number,
      required: true,
      min: 2,
      max: 4,
    },
  },
  { versionKey: false },
)

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
  },
  { versionKey: false, timestamps: true },
)

// Create indexes for searching
schema.index({ name: 'text', composer: 'text', description: 'text' })
schema.index({ submitter: 1 })

export default mongoose.models.patterns || mongoose.model('patterns', schema)
