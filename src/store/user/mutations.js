export function login (state, data) {
  state.id = data.id
  state.username = data.username
  state.avatar = data.avatar
}

export function addjwt (state, data) {
  state.jwt = data
}

export function addtoken (state, data) {
  state.token = data
}

export function logout (state) {
  state.token = ''
  state.id = ''
  state.username = ''
  state.avatar = ''
  state.jwt = ''
}
