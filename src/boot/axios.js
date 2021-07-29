import axios from 'axios'

export default ({ Vue, router, store }) => {
  Vue.prototype.$axios = axios

  Vue.prototype.$axios.interceptors.response.use((response) => {
    return response
  }, (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const extendUrl = '/api/users/extend'
        if (!error.config.url.href.includes(extendUrl) && !error.config.url.href.includes('discord')) {
          const originalRequest = error.config

          return axios.post(new URL('/api/users/extend', process.env.HOST_URL), {}, {
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
