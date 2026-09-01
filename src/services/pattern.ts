import type { ApiResponse } from '@/types/api'
import type { IPattern, IPatternForm, IPatternSearchParams } from '@/types/pattern'
import type { AxiosResponse } from 'axios'
import api from '@/utils/api'

export const search = (
  params: IPatternSearchParams,
): Promise<AxiosResponse<ApiResponse<IPattern[]>>> => {
  return api.get('/patterns', { params })
}

export const searchID = (id: string): Promise<AxiosResponse<ApiResponse<IPattern>>> => {
  return api.get('/patterns/' + id)
}

export const create = (form: IPatternForm): Promise<AxiosResponse<ApiResponse<string>>> => {
  return api.post('/patterns', form)
}

export const update = (
  id: string,
  form: IPatternForm,
): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.patch('/patterns/' + id, form)
}

export const del = (id: string): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.delete('/patterns/' + id)
}
