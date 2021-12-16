const comments = require('../models/comments.js')

module.exports = {
  async create (req, res) {
    try {
      await comments.create({
        pattern: req.body.pattern,
        rating: req.body.rating,
        replies: [
          {
            user: req.user._id,
            comment: req.body.comment
          }
        ]
      })
      res.status(200).send({ success: true, message: '' })
    } catch (error) {
      console.log(error)
      if (error.name === 'ValidationError') {
        res.status(400).send({ success: false, message: 'Validation Failed' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  }
}
