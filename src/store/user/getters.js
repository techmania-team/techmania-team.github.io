export function getUserData (state) {
  state.avatar_url = `https://cdn.discordapp.com/avatars/${state.id}/${state.avatar}.png`
  return state
}
