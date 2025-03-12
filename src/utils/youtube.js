export const getIDFromYouTubeLink = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : false
}

export const getYouTubeThumbnail = (ytid) => {
  return `http://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
}
