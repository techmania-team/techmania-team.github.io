export function getProfile (state) {
  return { ...state, avatar: `https://cdn.discordapp.com/avatars/${state.discord}/${state.avatar}.png` }
}
