import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    // Discord ID
    discord: {
      type: String,
      required: true,
      unique: true,
    },
    // Discord username
    name: {
      type: String,
      required: true,
    },
    // Discord avatar
    avatar: {
      type: String,
    },
  },
  { versionKey: false },
)

export default mongoose.models.users || mongoose.model('users', schema)
