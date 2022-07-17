import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  },
  name: {
    type: String,
    required: true
  },
  // 0 = Note
  // 1 = VFX
  // 2 = Combo
  // 3 = Game UI
  type: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  link: {
    type: String,
    required: true
  },
  previews: {
    type: [
      {
        name: {
          type: String,
          required: true
        },
        ytid: {
          type: String,
          required: true
        }
      }
    ],
    default: []
  },
  description: {
    type: String
  },
  submitDate: {
    type: Date,
    default: Date.now
  },
  updateDate: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: ''
  }
}, { versionKey: false })

export default mongoose.model('skins', schema)
