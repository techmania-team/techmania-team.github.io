const mongoose = require('mongoose')
const comments = require('../models/comments.js')

module.exports = {
  async create (req, res) {
    try {
      let result = await comments.findOne({
        pattern: req.body.pattern,
        'replies.0.user': req.user._id
      })
      if (result) {
        res.status(400).send({ success: false, message: 'Already commented' })
        return
      }
      result = await comments.create({
        pattern: req.body.pattern,
        rating: req.body.rating,
        replies: [
          {
            user: req.user._id,
            comment: req.body.comment
          }
        ]
      })
      result = result.toObject()
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      console.log(error)
      if (error.name === 'ValidationError') {
        res.status(400).send({ success: false, message: 'Validation Failed' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async getByPattern (req, res) {
    try {
      const query = [
        // Find matching pattern id
        {
          $match: {
            pattern: mongoose.Types.ObjectId(req.params.id)
          }
        },
        // Sort by comment date
        {
          $sort: {
            'replies.date': -1
          }
        },
        {
          $limit: 10
        },
        // Unwind replies for lookup
        {
          $unwind: {
            path: '$replies'
          }
        },
        // Lookup user
        {
          $lookup: {
            from: 'users',
            localField: 'replies.user',
            foreignField: '_id',
            as: 'replies.user'
          }
        },
        // Unwind lookup result, always an array with 1 element
        {
          $unwind: {
            path: '$replies.user'
          }
        },
        // Remove unnecessary user fields
        {
          $unset: [
            'replies.user.accessInfo'
          ]
        },
        // Group pattern result back
        {
          $group: {
            _id: '$_id',
            pattern: {
              $first: '$pattern'
            },
            rating: {
              $first: '$rating'
            },
            replies: {
              $push: '$replies'
            }
          }
        }
      ]

      if (req.query.limit && !isNaN(req.query.limit)) {
        query[1].$limit = parseInt(req.query.limit)
      }

      if (req.query.skip && !isNaN(req.query.skip) && req.query.skip > 0) {
        query.splice(2, 0, { $skip: parseInt(req.query.skip) })
      }

      const result = await comments.aggregate(query)
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      console.log(error)
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  }
}
