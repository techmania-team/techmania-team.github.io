/**
 * Open a link in target
 * @param url link to open
 * @param target target
 */
export const openLink = (url, target) => {
  if (process.env.SERVER) return
  window.open(url, target)
}
