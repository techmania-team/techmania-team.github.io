import mongoose from 'mongoose'
import { SKIN_NOTE, SKIN_VFX, SKIN_COMBO, SKIN_GAMEUI, SKIN_THEME } from 'src/utils/skin'

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
    type: {
      type: Number,
      required: true,
      enum: [SKIN_NOTE, SKIN_VFX, SKIN_COMBO, SKIN_GAMEUI, SKIN_THEME],
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
schema.index({ name: 'text', description: 'text' })
schema.index({ submitter: 1 })

export default mongoose.models.skins || mongoose.model('skins', schema)
