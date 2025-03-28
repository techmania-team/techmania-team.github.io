import mongoose from 'mongoose'

const ReplySchema = new mongoose.Schema(
  {
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
      // user id string as key, vote as value
      // { id1: 1, id2: -1 }
      type: Map,
      of: {
        type: Number,
        enum: [1, -1],
      },
      default: {},
    },
    // Deleted
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true },
)

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

schema.index({ pattern: 1 })
schema.index({ skin: 1 })
schema.index({ setlist: 1 })

export default mongoose.models.comments || mongoose.model('comments', schema)
