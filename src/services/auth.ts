import type { ApiResponse } from '@/types/api'
import type { IAuthInfo } from '@/types/auth'
import type { AxiosResponse } from 'axios'
import api from '@/utils/api'

export const getAuthInfo = (): Promise<AxiosResponse<ApiResponse<IAuthInfo>>> => {
  return api.get('/auth/user')
}
