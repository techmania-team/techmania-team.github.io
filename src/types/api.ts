export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  result: T
}
