export function setProfile (state, data) {
  state.name = data.name
  state.avatar = data.avatar
  state.discord = data.discord
  state.patternCount = data.patternCount || 0
  state.skinCount = data.skinCount || 0
  state.replyCount = data.replyCount || 0
  state._id = data._id
}

export function resetProfile (state) {
  state.name = ''
  state.avatar = ''
  state.discord = ''
  state.patternCount = 0
  state.skinCount = 0
  state.replyCount = 0
  state._id = ''
}
