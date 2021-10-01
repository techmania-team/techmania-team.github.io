import axios from 'axios'

export async function fetchData ({ commit }, id) {
  try {
    let win = axios.get('https://api.github.com/repos/techmania-team/techmania/releases')
    let ios = axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases')
    let mac = axios.get('https://api.github.com/repos/fhalfkg/techmania/releases')
    let and = axios.get('https://api.github.com/repos/rogeraabbccdd/techmania/releases')
    let pt = axios.get(new URL('/api/patterns?start=0&limit=8', process.env.HOST_URL).toString())
    let skin = axios.get(new URL('/api/skins?start=0&limit=8', process.env.HOST_URL).toString())
    let vid = axios.get(new URL('/api/patterns/indexvideo', process.env.HOST_URL).toString())
    win = await win
    ios = await ios
    mac = await mac
    and = await and
    pt = await pt
    skin = await skin
    vid = await vid
    commit('setTag', { win: win.data[0].tag_name, ios: ios.data[0].tag_name, mac: mac.data[0].tag_name, android: and.data[0].tag_name })
    commit('setPublish', { win: win.data[0].published_at, ios: ios.data[0].published_at, mac: mac.data[0].published_at, android: and.data[0].published_at })
    commit('setPt', pt.data.result)
    commit('setSkin', skin.data.result)
    vid = vid.data.result.map(v => 'https://www.youtube.com/embed/' + v.ytid)
    commit('setVid', vid)
  } catch (_) {
  }
}
