import type { ApiResponse } from '@/types/api'
import type { IChangelog, IRelease } from '@/types/info'
import type { AxiosResponse } from 'axios'
import api from '@/utils/api'

export const getReleases = (): Promise<AxiosResponse<ApiResponse<IRelease>>> => {
  return api.get('/info/releases')
}

export const getChangelogs = (): Promise<AxiosResponse<ApiResponse<IChangelog[]>>> => {
  return api.get('/info/changelogs')
}
