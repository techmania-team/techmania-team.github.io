export async function fetchData ({ commit }) {
  try {
    const [pt, skin, vid] = await Promise.all([
      this._vm.$api.get(new URL('/api/patterns?start=0&limit=8', process.env.HOST_URL).toString()),
      this._vm.$api.get(new URL('/api/skins?start=0&limit=8', process.env.HOST_URL).toString()),
      this._vm.$api.get(new URL('/api/patterns/indexvideo', process.env.HOST_URL).toString())
    ])
    commit('setPt', pt.data.result)
    commit('setSkin', skin.data.result)
    commit('setVid', vid.data.result.map(v => 'https://www.youtube.com/embed/' + v.ytid))
  } catch (_) {
  }
}

export async function fetchGitHub ({ commit }) {
  try {
    const [win, ios, mac, and] = await Promise.all([
      this._vm.$axios.get('https://api.github.com/repos/techmania-team/techmania/releases'),
      this._vm.$axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases'),
      this._vm.$axios.get('https://api.github.com/repos/fhalfkg/techmania/releases'),
      this._vm.$axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases')
    ])
    commit('setTag', { win: win.data[0].tag_name, ios: ios.data[0].tag_name, mac: mac.data[0].tag_name, android: and.data[0].tag_name })
    commit('setPublish', { win: win.data[0].published_at, ios: ios.data[0].published_at, mac: mac.data[0].published_at, android: and.data[0].published_at })
  } catch (_) {
  }
}
