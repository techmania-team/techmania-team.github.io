import axios from 'axios'
import handleError from './handleError'

export const checkImage = async (link) => {
  let valid = false
  try {
    const response = await axios.get(link)
    if (response.headers['content-type'].includes('image')) {
      valid = true
    }
  } catch (error) {
    handleError(error)
  }
  return valid
}
