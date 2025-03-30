import axios from 'axios'
import handleServerError from './handleServerError'

export const checkImage = async (link) => {
  let valid = false
  try {
    const response = await axios.get(link)
    if (response.headers['content-type'].includes('image')) {
      valid = true
    }
  } catch (error) {
    handleServerError(error)
  }
  return valid
}
