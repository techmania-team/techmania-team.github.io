import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'

const api = axios.create({
  baseURL: new URL('/api', process.env.HOST_URL).toString(),
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const extendUrl = '/users/extend'
        if (!error.config.url.href.includes(extendUrl)) {
          const originalRequest = error.config
          const user = useUserStore()
          const router = useRouter()
          return axios
            .post(
              extendUrl,
              {},
              {
                headers: { Authorization: `Bearer ${user.jwt}` },
              },
            )
            .then(({ data }) => {
              user.jwt = data.jwt
              user.token = data.token
              user._id = data.id
              originalRequest.headers.Authorization = 'Bearer ' + user.jwt
              return axios(originalRequest)
            })
            .catch((error) => {
              user.logout()
              router.push('/')
              return Promise.reject(error)
            })
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
