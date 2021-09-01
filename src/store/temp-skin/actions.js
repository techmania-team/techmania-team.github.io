import axios from 'axios'

export function fetchSkin ({ commit }, id) {
  return axios.get(new URL(`/api/skins/${id}`, process.env.HOST_URL).toString()).then(({ data }) => {
    commit('setSkin', data.result)
  }, () => {})
}
