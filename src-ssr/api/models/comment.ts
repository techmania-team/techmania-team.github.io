import type { HydratedDocument, Model, Types } from 'mongoose'
import mongoose, { model, Schema } from 'mongoose'

export type VoteValue = 1 | -1

export interface ICommentReply {
  _id: Types.ObjectId
  user: Types.ObjectId
  comment: string
  votes: Map<string, VoteValue>
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IComment {
  _id: Types.ObjectId
  pattern: Types.ObjectId
  skin: Types.ObjectId
  setlist: Types.ObjectId
  rating: number
  replies: Types.DocumentArray<ICommentReply>
}

export type TCommentDocument = HydratedDocument<IComment>

const ReplySchema = new Schema<ICommentReply>(
  {
    // User ID
    user: {
      type: Schema.Types.ObjectId,
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
  { timestamps: true },
)

const schema = new Schema<IComment>({
  // Pattern ID
  pattern: {
    type: Schema.Types.ObjectId,
    ref: 'patterns',
  },
  skin: {
    type: Schema.Types.ObjectId,
    ref: 'skins',
  },
  setlist: {
    type: Schema.Types.ObjectId,
    ref: 'setlists',
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
})

schema.pre('validate', function () {
  const hasPattern = !!this.pattern
  const hasSkin = !!this.skin
  const hasSetlist = !!this.setlist

  const filledCount = [hasPattern, hasSkin, hasSetlist].filter(Boolean).length

  if (filledCount !== 1) {
    this.invalidate('pattern', 'Only one of pattern, skin, or setlist should be filled')
  }
})

schema.index({ pattern: 1 })
schema.index({ skin: 1 })
schema.index({ setlist: 1 })

const Comment: Model<IComment> = mongoose.models.comments || model<IComment>('comments', schema)

export default Comment
