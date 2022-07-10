export async function fetchProfile ({ commit }, id) {
  return this._vm.$api.get(`/users/${id}`).then(({ data }) => {
    commit('setProfile', data.result)
  }, () => {})
}
