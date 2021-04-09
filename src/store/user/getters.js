export function getUserData (state) {
  const data = { ...state, avatar_url: `https://cdn.discordapp.com/avatars/${state.discord}/${state.avatar}.png` }
  return data
}
