import type { IPattern } from './pattern'
import type { ISetlist } from './setlist'
import type { ISkin } from './skin'

export interface ICommentReply {
  _id: string
  user: {
    _id: string
    name: string
    avatar: string
  }
  comment: string
  votes: {
    sum: number
    voted: number
  }
  createdAt: string
  updatedAt: string
}

export interface IComment {
  _id: string
  pattern?: string
  skin?: string
  setlist?: string
  rating: number
  replies: ICommentReply[]
}

export interface ICommentDetailed {
  _id: string
  pattern?: IPattern
  skin?: ISkin
  setlist?: ISetlist
  replies: ICommentReply[]
  comment: string
  rating: number
}
