import { defineSsrMiddleware } from '#q-app/wrappers'
import { initializeApi } from '../api/index.js'

export default defineSsrMiddleware(async ({ app }) => {
  await initializeApi(app)
})
