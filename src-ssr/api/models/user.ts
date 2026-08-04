import type { HydratedDocument, Model, Types } from 'mongoose'
import mongoose, { model, Schema } from 'mongoose'

export interface IUser {
  _id: Types.ObjectId
  discord: string
  name: string
  avatar: string
}

export type TUserDocument = HydratedDocument<IUser>

const schema = new Schema<IUser>({
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
})

const User: Model<IUser> = mongoose.models.users || model<IUser>('users', schema)

export default User
