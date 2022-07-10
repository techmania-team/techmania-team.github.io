import axios from 'axios'

const api = axios.create({
  baseURL: new URL('/api', process.env.HOST_URL).toString()
})

export default ({ Vue, router, store }) => {
  Vue.prototype.$axios = axios

  Vue.prototype.$api = api

  Vue.prototype.$api.interceptors.response.use((response) => {
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
}
