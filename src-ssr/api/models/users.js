import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    // Discord ID
    discord: {
      type: String,
      required: true,
      unique: true,
    },
    discordToken: {
      type: String,
      required: true,
      unique: true,
    },
    discordRefreshToken: {
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

schema.pre('save', function (next) {
  const MAX_LENGTH = 5
  if (this.accessInfo.length > MAX_LENGTH) {
    this.accessInfo.splice(0, this.accessInfo.length - MAX_LENGTH) // 移除第一個元素
  }
  next()
})

export default mongoose.models.users || mongoose.model('users', schema)
