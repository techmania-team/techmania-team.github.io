export function setProfile (state, data) {
  state.name = data.name
  state.avatar = data.avatar
  state.discord = data.discord
  state.patternCount = data.patternCount
  state.skinCount = data.skinCount
  state._id = data._id
}

export function resetProfile (state) {
  state.name = ''
  state.avatar = ''
  state.discord = ''
  state.patternCount = 0
  state.skinCount = 0
  state._id = ''
}
