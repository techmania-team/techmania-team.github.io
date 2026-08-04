import type { ApiResponse } from '@/types/api'
import type { ISetlist, ISetlistForm, ISetlistSearchParams } from '@/types/setlist'
import type { AxiosResponse } from 'axios'
import api from '@/utils/api'

export const search = (
  params: ISetlistSearchParams,
): Promise<AxiosResponse<ApiResponse<ISetlist[]>>> => {
  return api.get('/setlists', { params })
}

export const searchID = (id: string): Promise<AxiosResponse<ApiResponse<ISetlist>>> => {
  return api.get('/setlists/' + id)
}

export const create = (form: ISetlistForm): Promise<AxiosResponse<ApiResponse<string>>> => {
  return api.post('/setlists', form)
}

export const update = (
  id: string,
  form: ISetlistForm,
): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.patch('/setlists/' + id, form)
}

export const del = (id: string): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.delete('/setlists/' + id)
}
