import axios from 'axios'

export async function fetchProfile ({ commit }, id) {
  return axios.get(new URL(`/api/users/${id}`, process.env.HOST_URL).toString()).then(({ data }) => {
    commit('setProfile', data.result)
  }, () => {})
}
