import axios from 'axios'

const api = axios.create({
  baseURL: new URL('/api', import.meta.env.QCLI_HOST_URL).toString(),
  withCredentials: true,
})

export default api
