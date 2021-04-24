export function login (state, data) {
  state.discord = data.id
  state.username = data.username
  state.avatar = data.avatar
}

export function addjwt (state, data) {
  state.jwt = data
}

export function addtoken (state, data) {
  state.token = data
}

export function addid (state, data) {
  state.id = data
}

export function logout (state) {
  state.token = ''
  state.id = ''
  state.username = ''
  state.avatar = ''
  state.jwt = ''
  state.discord = ''
}

export function setLocale (state, data) {
  state.locale = data
}
