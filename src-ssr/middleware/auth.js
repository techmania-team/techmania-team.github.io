const jwt = require('jsonwebtoken')
const users = require('../models/users.js')

module.exports = async (req, res, next) => {
  let decoded = {}
  try {
    const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : ''
    // a trick to get decoded data when verify error.
    decoded = jwt.decode(token, process.env.JWT_SECRET)
    const _id = decoded._id
    req.user = await users.findOne({ _id, 'accessInfo.jwt': token })
    req.token = token
    jwt.verify(token, process.env.JWT_SECRET)
    if (req.user !== null) {
      next()
    } else {
      throw new Error()
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError' && req.baseUrl === '/api/users' && (req.path === '/extend' || req.path === '/logout')) {
      next()
    } else {
      res.status(401).send({ success: false, message: 'Unauthorized' })
    }
  }
}
