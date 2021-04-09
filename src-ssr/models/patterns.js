const mongoose = require('mongoose')

const difficultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  // 0 = Touch
  // 1 = Keyboard
  // 2 = KM
  control: {
    type: Number,
    required: true,
    min: 0,
    max: 2
  }
}, { versionKey: false })

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
  composer: {
    type: String,
    required: true
  },
  keysounded: {
    type: Boolean,
    required: true
  },
  difficulties: {
    type: [difficultySchema],
    required: true
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
    type: String,
    required: true
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

module.exports = mongoose.model('patterns', schema)
