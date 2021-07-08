export function getUserData (state) {
  let locale2 = ''
  switch (state.locale) {
    case 'en-us':
      locale2 = 'enUS'
      break
    case 'zh-tw':
      locale2 = 'zhTW'
      break
    case 'zh-cn':
      locale2 = 'zhCN'
      break
    case 'ja-jp':
      locale2 = 'ja'
      break
    case 'ko-kr':
      locale2 = 'ko'
      break
  }

  const data = Object.assign({}, state)
  data.avatar_url = `https://cdn.discordapp.com/avatars/${state.discord}/${state.avatar}.png`
  data.locale2 = locale2
  return data
}
