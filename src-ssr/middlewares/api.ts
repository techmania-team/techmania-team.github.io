import type { Express } from 'express'
import { defineSsrMiddleware } from '#q-app'
import { initializeApi } from '../api'

export default defineSsrMiddleware(async ({ app }) => {
  await initializeApi(app as Express)
})
