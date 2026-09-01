import type { ApiResponse } from '@/types/api'
import type { ISkin, ISkinForm, ISkinSearchParams } from '@/types/skin'
import type { AxiosResponse } from 'axios'
import api from '@/utils/api'

export const search = (params: ISkinSearchParams): Promise<AxiosResponse<ApiResponse<ISkin[]>>> => {
  return api.get('/skins', { params })
}

export const searchID = (id: string): Promise<AxiosResponse<ApiResponse<ISkin>>> => {
  return api.get('/skins/' + id)
}

export const create = (form: ISkinForm): Promise<AxiosResponse<ApiResponse<string>>> => {
  return api.post('/skins', form)
}

export const update = (id: string, form: ISkinForm): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.patch('/skins/' + id, form)
}

export const del = (id: string): Promise<AxiosResponse<ApiResponse<null>>> => {
  return api.delete('/skins/' + id)
}
