const mongoose = require('mongoose')

const VoteSchema = new mongoose.Schema({
  // User ID
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  },
  // Upvote or downvote
  positive: {
    type: Number,
    enum: [1, -1],
    required: true
  }
})

const ReplySchema = new mongoose.Schema({
  // User ID
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  },
  // Comment text
  comment: {
    type: String,
    required: true
  },
  // Votes
  votes: {
    type: [VoteSchema],
    default: []
  },
  // Post date
  date: {
    type: Date,
    default: Date.now
  },
  // Update date
  updateDate: {
    type: Date,
    default: Date.now
  }
})

const schema = new mongoose.Schema({
  // Pattern ID
  pattern: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'patterns'
  },
  // Rating
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  // Replies
  replies: {
    type: [ReplySchema],
    default: []
  }
}, { versionKey: false })

module.exports = mongoose.model('comments', schema)
