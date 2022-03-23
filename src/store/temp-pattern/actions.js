import { Notify } from 'quasar'
import { i18n } from '../../boot/i18n'

export function fetchPattern ({ commit }, id) {
  return this._vm.$api.get(`/patterns/${id}`).then(({ data }) => {
    commit('setPattern', data.result)
  }, () => {})
}

export function fetchComments ({ commit }, { id, start }) {
  return this._vm.$api.get(`/comments/patterns/${id}?skip=${start}`).then(({ data }) => {
    // If user is logged in, remove user's comment
    if (this.state.user.jwt.length > 0) {
      data.result = data.result.filter(comment => {
        return comment.replies[0].user._id !== this.state.user._id
      })
    }
    if (data.result.length === 0) commit('setCommentsScrollDisable')
    else commit('setComments', data.result)
  }, () => {})
}

export function fetchMyComment ({ commit }, id) {
  if (this.state.user.jwt.length === 0) return
  return this._vm.$api.get(`/comments/patterns/${id}/my`, {
    headers: { Authorization: `Bearer ${this.state.user.jwt}` }
  }).then(({ data }) => {
    if (data.result.length > 0) commit('setMyComment', data.result[0])
  }, () => {})
}

export async function submitComment ({ commit, state, dispatch }, data) {
  try {
    const response = await this._vm.$api.post(
      '/comments/',
      { rating: data.rating, comment: data.comment, pattern: state._id, 'g-recaptcha-response': data.token },
      { headers: { Authorization: `Bearer ${this.state.user.jwt}` } }
    )
    commit('setMyComment', { ...response.data.result })
    await dispatch('updateRating')
  } catch (error) {}
}

export async function vote ({ commit }, data) {
  try {
    await this._vm.$api.patch(
      `/comments/${data.cid}/replies/${data.rid}/votes`,
      { positive: data.positive },
      { headers: { Authorization: `Bearer ${this.state.user.jwt}` } }
    )
    commit('setVote', data)
  } catch (error) {
    Notify.create({
      icon: 'warning',
      color: 'negative',
      message: i18n.t('submitForm.errorServer')
    })
  }
}

export async function updateRating ({ commit, state }) {
  try {
    const { data } = await this._vm.$api.get(`/comments/patterns/${state._id}/rating`)
    commit('updateRating', { ...data.result })
  } catch (error) {}
}

export async function reply ({ commit }, data) {
  try {
    const { data: result } = await this._vm.$api.post(
      `/comments/${data.cid}/replies`,
      { comment: data.comment, 'g-recaptcha-response': data.token },
      {
        headers: { Authorization: `Bearer ${this.state.user.jwt}` }
      }
    )
    commit('createReply', { result: result.result, cid: data.cid, comment: data.comment })
  } catch (error) {
    Notify.create({
      icon: 'warning',
      color: 'negative',
      message: i18n.t('submitForm.errorServer')
    })
  }
}

export async function editComment ({ commit, dispatch }, data) {
  try {
    await this._vm.$api.patch(
      `/comments/${data.cid}`,
      { rating: data.rating, comment: data.comment, 'g-recaptcha-response': data.token },
      { headers: { Authorization: `Bearer ${this.state.user.jwt}` } }
    )
    commit('editMyComment', { rating: data.rating, comment: data.comment })
    await dispatch('updateRating')
  } catch (error) {
    Notify.create({
      icon: 'warning',
      color: 'negative',
      message: i18n.t('submitForm.errorServer')
    })
  }
}

export async function editReply ({ commit }, data) {
  try {
    await this._vm.$api.patch(
      `/comments/${data.cid}/replies/${data._id}`,
      { comment: data.comment, 'g-recaptcha-response': data.token },
      { headers: { Authorization: `Bearer ${this.state.user.jwt}` } }
    )
    commit('editReply', { cid: data.cid, rid: data._id, comment: data.comment })
  } catch (error) {
    Notify.create({
      icon: 'warning',
      color: 'negative',
      message: i18n.t('submitForm.errorServer')
    })
  }
}

export async function deleteMyComment ({ commit, dispatch }, data) {
  try {
    await this._vm.$api.delete(`/comments/${data.cid}`,
      { headers: { Authorization: `Bearer ${this.state.user.jwt}` } }
    )
    commit('deleteMyComment', { cid: data.cid })
    await dispatch('updateRating')
  } catch (error) {}
}

export async function deleteReply ({ commit }, data) {
  try {
    await this._vm.$api.patch(
      `/comments/${data.cid}/replies/${data._id}`,
      { deleted: true, 'g-recaptcha-response': data.token },
      {
        headers: { Authorization: `Bearer ${this.state.user.jwt}` }
      }
    )
    commit('editReply', { cid: data.cid, rid: data._id, deleted: true })
  } catch (error) {}
}
