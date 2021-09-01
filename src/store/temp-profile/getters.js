export function getProfile (state) {
  return {
    ...state,
    avatar: (state.discord.length === 0 || state.avatar.length === 0) ? 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png' : `https://cdn.discordapp.com/avatars/${state.discord}/${state.avatar}.png`
  }
}
