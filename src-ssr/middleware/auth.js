const jwt = require('jsonwebtoken')
const users = require('../models/users.js')

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : ''
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const _id = decoded._id
      req.user = await users.findOne({ _id, 'accessInfo.jwt': token })
      req.token = token
      if (req.user !== null) {
        next()
      } else {
        throw new Error()
      }
    } else {
      throw new Error()
    }
  } catch (error) {
    res.status(401).send({ success: false, message: '未登入' })
  }
}
