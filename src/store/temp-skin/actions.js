export function fetchSkin ({ commit }, id) {
  return this._vm.$api.get(`/skins/${id}`).then(({ data }) => {
    commit('setSkin', data.result)
  }, () => {})
}

export function fetchComments ({ commit }, { id, start }) {
  return this._vm.$api.get(`/comments/skins/${id}?skip=${start}`).then(({ data }) => {
    // If user is logged in, remove user's comment
    if (this.state.user.jwt.length > 0) {
      data.result = data.result.filter(comment => {
        return comment.replies[0].user._id !== this.state.user.id
      })
    }
    if (data.result.length === 0) commit('setCommentsScrollDisable')
    else commit('setComments', data.result)
  }, () => {})
}

export function fetchMyComment ({ commit }, id) {
  if (this.state.user.jwt.length === 0) return
  return this._vm.$api.get(`/comments/skins/${id}/my`, {
    headers: { Authorization: `Bearer ${this.state.user.jwt}` }
  }).then(({ data }) => {
    if (data.result.length > 0) commit('setMyComment', data.result[0])
  }, () => {})
}
