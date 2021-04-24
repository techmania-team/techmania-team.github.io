export function getUserData (state) {
  const data = Object.assign(state, { avatar_url: `https://cdn.discordapp.com/avatars/${state.discord}/${state.avatar}.png` })
  return data
}

export function getLocale (state) {
  return state.locale
}
