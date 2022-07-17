import mongoose from 'mongoose'

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
}, { versionKey: false })

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
  avatar: {
    type: String
  },
  accessInfo: {
    type: [AccessInfoSchema]
  }
}, { versionKey: false })

export default mongoose.model('users', schema)
