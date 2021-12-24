export async function fetchData ({ commit }) {
  try {
    let pt = this._vm.$api.get(new URL('/api/patterns?start=0&limit=8', process.env.HOST_URL).toString())
    let skin = this._vm.$api.get(new URL('/api/skins?start=0&limit=8', process.env.HOST_URL).toString())
    let vid = this._vm.$api.get(new URL('/api/patterns/indexvideo', process.env.HOST_URL).toString())
    pt = await pt
    skin = await skin
    vid = await vid
    commit('setPt', pt.data.result)
    commit('setSkin', skin.data.result)
    vid = vid.data.result.map(v => 'https://www.youtube.com/embed/' + v.ytid)
    commit('setVid', vid)
  } catch (_) {
  }
}

export async function fetchGitHub ({ commit }) {
  try {
    let win = this._vm.$axios.get('https://api.github.com/repos/techmania-team/techmania/releases')
    let ios = this._vm.$axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases')
    let mac = this._vm.$axios.get('https://api.github.com/repos/fhalfkg/techmania/releases')
    let and = this._vm.$axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases')
    win = await win
    ios = await ios
    mac = await mac
    and = await and
    commit('setTag', { win: win.data[0].tag_name, ios: ios.data[0].tag_name, mac: mac.data[0].tag_name, android: and.data[0].tag_name })
    commit('setPublish', { win: win.data[0].published_at, ios: ios.data[0].published_at, mac: mac.data[0].published_at, android: and.data[0].published_at })
  } catch (_) {
  }
}
