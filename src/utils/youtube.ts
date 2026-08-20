export const getIDFromYouTubeLink = (url: string) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7]?.length === 11 ? match[7] : ''
}

export const getYouTubeThumbnail = (ytid: string) => {
  return `https://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
}
