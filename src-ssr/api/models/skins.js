import mongoose from 'mongoose'

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
    // 0 = Note
    // 1 = VFX
    // 2 = Combo
    // 3 = Game UI
    type: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
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
