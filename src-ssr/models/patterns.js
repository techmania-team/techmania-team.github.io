const mongoose = require('mongoose')

const difficultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  // 0 = Touch
  // 1 = Keyboard
  // 2 = KM
  countrol: {
    type: Number,
    required: true,
    min: 0,
    max: 2
  }
})

const previewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  ytid: {
    type: String,
    required: true
  }
})

const schema = new mongoose.Schema({
  submitter: {
    type: String,
    required: true
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
  }
})

module.exports = mongoose.model('patterns', schema)
