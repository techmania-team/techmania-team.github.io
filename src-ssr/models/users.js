const mongoose = require('mongoose')

const AccessInfoSchema = new mongoose.Schema({
  jwt: {
    type: String,
    required: true
  },
  discord: {
    type: String,
    required: true
  },
  discordRefresh: {
    type: String,
    required: true
  }
})

const schema = new mongoose.Schema({
  discord: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  accessInfo: {
    type: [AccessInfoSchema]
  }
})

module.exports = mongoose.model('users', schema)
