import axios from 'axios'

export function fetchPattern ({ commit }, id) {
  return axios.get(new URL(`/api/patterns/${id}`, process.env.HOST_URL).toString()).then(({ data }) => {
    commit('setPattern', data.result)
  }, () => {})
}
