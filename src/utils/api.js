import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

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
        const store = useStore()
        const router = useRouter()
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

export default api
