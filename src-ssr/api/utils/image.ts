import axios from 'axios'

export const checkImage = async (link: string) => {
  let valid = false
  const response = await axios.head(link)
  const contentType = response.headers?.['content-type']
  if (typeof contentType === 'string' && contentType.includes('image')) {
    valid = true
  }
  return valid
}
