export function fetchSkin ({ commit }, id) {
  return this._vm.$api.get(`/skins/${id}`).then(({ data }) => {
    commit('setSkin', data.result)
  }, () => {})
}
