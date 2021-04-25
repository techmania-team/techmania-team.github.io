export function getUserData (state) {
  let locale2 = state.locale
  if (locale2 === 'ja-jp') locale2 = 'ja'
  else if (locale2 === 'ko-kr') locale2 = 'ko'

  const data = Object.assign({}, state)
  data.avatar_url = `https://cdn.discordapp.com/avatars/${state.discord}/${state.avatar}.png`
  data.locale2 = locale2
  return data
}
