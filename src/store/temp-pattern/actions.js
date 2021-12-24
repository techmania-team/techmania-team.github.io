export function fetchPattern ({ commit }, id) {
  return this._vm.$api.get(`/patterns/${id}`).then(({ data }) => {
    commit('setPattern', data.result)
  }, () => {})
}
