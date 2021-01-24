export function login (state, data) {
  state.token = data.token
  state.id = data.id
  state.username = data.username
  state.avatar = data.avatar
}

export function logout (state) {
  state.token = ''
  state.id = ''
  state.username = ''
  state.avatar = ''
}
