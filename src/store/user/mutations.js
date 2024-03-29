export function login (state, data) {
  state.discord = data.discord
  state.username = data.username
  state.avatar = data.avatar
  state._id = data._id
  state.token = data.token
}

export function loginDiscord (state, data) {
  state.discord = data.id
  state.username = data.username
  state.avatar = data.avatar
}

export function addjwt (state, data) {
  state.jwt = data
  state.jwtReceived = Date.now()
}

export function addtoken (state, data) {
  state.token = data
}

export function addid (state, data) {
  state._id = data
}

export function logout (state) {
  state.token = ''
  state._id = ''
  state.username = ''
  state.avatar = ''
  state.jwt = ''
  state.discord = ''
  state.jwtReceived = 0
}

export function setLocale (state, data) {
  state.locale = data
}
