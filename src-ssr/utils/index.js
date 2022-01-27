const axios = require('axios')

module.exports = {
  checkImage: async (url) => {
    let valid = false
    try {
      const response = await axios.get(url)
      if (response.headers['content-type'].includes('image')) {
        valid = true
      }
    } catch (error) {
    }
    return valid
  }
}
