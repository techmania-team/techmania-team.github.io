const mongoose = require('mongoose')

const previewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  ytid: {
    type: String,
    required: true
  }
}, { versionKey: false })

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
    type: [previewSchema],
    required: true
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
  }
}, { versionKey: false })

module.exports = mongoose.model('skins', schema)
