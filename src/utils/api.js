import axios from 'axios'

const api = axios.create({
  baseURL: new URL('/api', process.env.HOST_URL).toString(),
})

export default api
