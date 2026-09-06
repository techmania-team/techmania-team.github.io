import axios from 'axios'

/**
 * Resolve the base URL for API calls.
 *
 * On the server (SSR preFetch), requests must NOT go out to the public
 * QCLI_HOST_URL: that would leave the dyno, hit the Heroku router and come
 * back to the very same process. It multiplies the socket count, burns the
 * global rate limiter and adds a full internet round trip to every render.
 * Talk to ourselves over the loopback interface instead.
 */
const getBaseUrl = () => {
  if (import.meta.env.QUASAR_SERVER) {
    return `http://127.0.0.1:${process.env.PORT || 3000}`
  }
  return import.meta.env.QCLI_HOST_URL
}

const api = axios.create({
  baseURL: new URL('/api', getBaseUrl()).toString(),
  // Without a timeout a slow response keeps the whole SSR render alive:
  // the Vue app, its Pinia stores and the i18n instance stay reachable and
  // pile up in the heap long after Heroku's 30s router timeout cut the client off.
  timeout: 5000,
  withCredentials: true,
})

export default api
