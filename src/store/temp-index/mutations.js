export function setTag (state, data) {
  state.tag.win = data.win
  state.tag.ios = data.ios
  state.tag.mac = data.mac
  state.tag.android = data.android
}

export function setPublish (state, data) {
  state.publishDate.win = data.win
  state.publishDate.ios = data.ios
  state.publishDate.mac = data.mac
  state.publishDate.android = data.android
}

export function setPt (state, data) {
  state.patterns = data
}

export function setVid (state, data) {
  state.videos = data
}
