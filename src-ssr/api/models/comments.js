import mongoose from 'mongoose'

const VoteSchema = new mongoose.Schema({
  // User ID
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  // Upvote or downvote
  positive: {
    type: Number,
    enum: [1, -1],
    required: true,
  },
})

const ReplySchema = new mongoose.Schema({
  // User ID
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  // Comment text
  comment: {
    type: String,
    required: true,
  },
  // Votes
  votes: {
    type: [VoteSchema],
    default: [],
  },
  // Post date
  date: {
    type: Date,
    default: Date.now,
  },
  // Update date
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
})

const schema = new mongoose.Schema(
  {
    // Pattern ID
    pattern: {
      type: mongoose.Schema.Types.ObjectId,
      required() {
        return !this.skin || this.skin.length === 0
      },
      ref: 'patterns',
    },
    skin: {
      type: mongoose.Schema.Types.ObjectId,
      required() {
        return !this.pattern || this.pattern.length === 0
      },
      ref: 'skins',
    },
    // Rating
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    // Replies
    replies: {
      type: [ReplySchema],
      default: [],
    },
  },
  { versionKey: false },
)

export default mongoose.models.comments || mongoose.model('comments', schema)
