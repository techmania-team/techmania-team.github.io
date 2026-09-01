import type { ApiResponse } from '@/types/api'
import type { IUSer } from '@/types/user'
import type { AxiosResponse } from 'axios'
import api from '@/utils/api'

export const searchID = (id: string): Promise<AxiosResponse<ApiResponse<IUSer>>> => {
  return api.get('/users/' + id)
}
