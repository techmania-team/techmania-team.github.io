import type { ApiResponse } from '@/types/api'
import type {
  IComment,
  ICommentDetailed,
  ICommentForm,
  ICommentReply,
  ICommentReplyForm,
  ICommentReplyUpdateForm,
  ICommentSearchParams,
  ICommentUpdateForm,
  ICommentVoteForm,
} from '@/types/comment'
import type { AxiosResponse } from 'axios'
import api from '@/utils/api'

export const create = (form: ICommentForm): Promise<AxiosResponse<ApiResponse<IComment>>> => {
  return api.post('/comments', form)
}

export const getMyCommmentByPattern = (
  pid: string,
): Promise<AxiosResponse<ApiResponse<IComment>>> => {
  return api.get(`/comments/pattern/${pid}/my`)
}

export const getByPattern = (pid: string): Promise<AxiosResponse<ApiResponse<IComment[]>>> => {
  return api.get(`/comments/pattern/${pid}`)
}

export const getMyCommmentBySkin = (sid: string): Promise<AxiosResponse<ApiResponse<IComment>>> => {
  return api.get(`/comments/skin/${sid}/my`)
}

export const getBySkin = (sid: string): Promise<AxiosResponse<ApiResponse<IComment[]>>> => {
  return api.get(`/comments/skin/${sid}`)
}

export const getMyCommmentBySetlist = (
  setid: string,
): Promise<AxiosResponse<ApiResponse<IComment>>> => {
  return api.get(`/comments/setlist/${setid}/my`)
}

export const getBySetlist = (setid: string): Promise<AxiosResponse<ApiResponse<IComment[]>>> => {
  return api.get(`/comments/setlist/${setid}`)
}

export const getByUser = (
  uid: string,
  params?: ICommentSearchParams,
): Promise<AxiosResponse<ApiResponse<ICommentDetailed[]>>> => {
  return api.get(`/comments/user/${uid}`, { params })
}

export const updateMyComment = (
  cid: string,
  form: ICommentUpdateForm,
): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.patch(`/comments/${cid}`, form)
}

export const createReply = (
  cid: string,
  form: ICommentReplyForm,
): Promise<AxiosResponse<ApiResponse<ICommentReply>>> => {
  return api.post(`/comments/${cid}/replies`, form)
}

export const updateMyReply = (
  cid: string,
  rid: string,
  form: ICommentReplyUpdateForm,
): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.patch(`/comments/${cid}/replies/${rid}`, form)
}

export const deleteMyReply = (
  cid: string,
  rid: string,
): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.delete(`/comments/${cid}/replies/${rid}`)
}

export const updateReplyVote = (
  cid: string,
  rid: string,
  form: ICommentVoteForm,
): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.patch(`/comments/${cid}/replies/${rid}/votes`, form)
}
