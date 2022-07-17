import { boot } from 'quasar/wrappers'
import axios from 'axios'
import store from '../store'
import router from '../router'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: new URL('/api', process.env.HOST_URL).toString()
})

api.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response) {
    if (error.response.status === 401) {
      const extendUrl = '/users/extend'
      if (!error.config.url.href.includes(extendUrl)) {
        const originalRequest = error.config
        return axios.post(extendUrl, {}, {
          headers: { Authorization: `Bearer ${store.state.user.jwt}` }
        }).then(({ data }) => {
          store.commit('user/addjwt', data.jwt)
          store.commit('user/addtoken', data.token)
          store.commit('user/addid', data.id)
          originalRequest.headers.Authorization = 'Bearer ' + store.state.user.jwt
          return axios(originalRequest)
        }).catch((error) => {
          store.commit('user/logout')
          router.push('/')
          return Promise.reject(error)
        })
      }
    }
  }
  return Promise.reject(error)
})

export default boot(({ app, router, store }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
