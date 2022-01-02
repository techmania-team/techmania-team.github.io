const mongoose = require('mongoose')
const comments = require('../models/comments.js')
const patterns = require('../models/patterns.js')
const skins = require('../models/skins.js')

module.exports = {
  async create (req, res) {
    try {
      const query = {
        pattern: req.body.pattern,
        'replies.0.user': req.user._id
      }
      if (req.body.pattern) {
        query.pattern = req.body.pattern
      } else if (req.body.skin) {
        query.skin = req.body.skin
      }
      let result = await comments.findOne(query)
      if (result) {
        res.status(400).send({ success: false, message: 'Already commented' })
        return
      }
      delete query['replies.0.user']
      query.rating = req.body.rating
      query.replies = [
        {
          user: req.user._id,
          comment: req.body.comment
        }
      ]
      result = await comments.create(query)
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

      if (req.query.limit && !isNaN(req.query.limit) && req.query.limit <= 10) {
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
  },
  async getMyCommmentByPattern (req, res) {
    try {
      const query = [
        // Find matching pattern id
        {
          $match: {
            pattern: mongoose.Types.ObjectId(req.params.id),
            'replies.0.user': req.user._id
          }
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
      const result = await comments.aggregate(query)
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async updateComment (req, res) {
    try {
      await comments.findByIdAndUpdate(req.params.id, {
        rating: req.body.rating,
        $set: { 'replies.0.comment': req.body.comment }
      }, { new: true })
      res.status(200).send({ success: true, message: '' })
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else if (error.name === 'ValidationError') {
        res.status(400).send({ success: false, message: 'Validation Failed' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async createReply (req, res) {
    try {
      const result = await comments.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.params.cid) },
        {
          $push: {
            replies: {
              user: mongoose.Types.ObjectId(req.user._id),
              comment: req.body.comment
            }
          }
        },
        { new: true, runValidators: true }
      )
      res.status(200).send({ success: true, message: '', result: { ...result.toObject().replies.pop() } })
    } catch (error) {
      console.log(error)
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else if (error.name === 'ValidationError') {
        res.status(400).send({ success: false, message: 'Validation Failed' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async updateReply (req, res) {
    try {
      await comments.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.cid),
          'replies._id': mongoose.Types.ObjectId(req.params.rid),
          'replies.user': req.user._id
        },
        {
          $set: {
            'replies.$[a].comment': req.body.comment
          }
        },
        { new: true, runValidators: true, arrayFilters: [{ 'a._id': req.params.rid }] }
      )
      res.status(200).send({ success: true, message: '' })
    } catch (error) {
      console.log(error)
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else if (error.name === 'ValidationError') {
        res.status(400).send({ success: false, message: 'Validation Failed' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async updateReplyVote (req, res) {
    try {
      if (req.body.positive === null || isNaN(req.body.positive) || req.body.positive > 1 || req.body.positive < -1) {
        res.status(400).send({ success: false, message: 'Validation Failed' })
        return
      }
      const positive = parseInt(req.body.positive)
      await comments.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.cid),
          'replies._id': mongoose.Types.ObjectId(req.params.rid)
        },
        {
          $pull: {
            'replies.$[a].votes': {
              user: mongoose.Types.ObjectId(req.user._id)
            }
          }
        },
        { new: true, runValidators: true, arrayFilters: [{ 'a._id': mongoose.Types.ObjectId(req.params.rid) }] }
      )
      if (positive !== 0) {
        await comments.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.params.cid),
            'replies._id': mongoose.Types.ObjectId(req.params.rid)
          },
          {
            $push: {
              'replies.$[a].votes': {
                user: mongoose.Types.ObjectId(req.user._id),
                positive
              }
            }
          },
          { new: true, runValidators: true, arrayFilters: [{ 'a._id': mongoose.Types.ObjectId(req.params.rid) }] }
        )
      }
      res.status(200).send({ success: true, message: '' })
    } catch (error) {
      console.log(error)
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else if (error.name === 'ValidationError') {
        res.status(400).send({ success: false, message: 'Validation Failed' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async getRatingByPattern (req, res) {
    try {
      const exists = await patterns.findById(req.params.id)
      if (!exists) {
        res.status(404).send({ success: false, message: 'Not found' })
        return
      }
      const result = await comments.aggregate([
        {
          $match: {
            pattern: mongoose.Types.ObjectId(req.params.id)
          }
        },
        {
          $group: {
            _id: '$pattern',
            rating: {
              $avg: '$rating'
            },
            count: {
              $sum: 1
            }
          }
        }
      ])
      res.status(200).send({
        success: true,
        message: '',
        result: {
          rating: result[0]?.rating || 0,
          count: result[0]?.count || 0
        }
      })
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async getRatingBySkin (req, res) {
    try {
      const exists = await skins.findById(req.params.id)
      if (!exists) {
        res.status(404).send({ success: false, message: 'Not found' })
        return
      }
      const result = await comments.aggregate([
        {
          $match: {
            skin: mongoose.Types.ObjectId(req.params.id)
          }
        },
        {
          $group: {
            _id: '$skin',
            rating: {
              $avg: '$rating'
            },
            count: {
              $sum: 1
            }
          }
        }
      ])
      res.status(200).send({
        success: true,
        message: '',
        result: {
          rating: result[0]?.rating || 0,
          count: result[0]?.count || 0
        }
      })
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async getBySkin (req, res) {
    try {
      const query = [
        // Find matching skin id
        {
          $match: {
            skin: mongoose.Types.ObjectId(req.params.id)
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
        // Group skin result back
        {
          $group: {
            _id: '$_id',
            skin: {
              $first: '$skin'
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

      if (req.query.limit && !isNaN(req.query.limit) && req.query.limit <= 10) {
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
  },
  async getMyCommmentBySkin (req, res) {
    try {
      const query = [
        // Find matching skin id
        {
          $match: {
            skin: mongoose.Types.ObjectId(req.params.id),
            'replies.0.user': req.user._id
          }
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
        // Group skin result back
        {
          $group: {
            _id: '$_id',
            skin: {
              $first: '$skin'
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
      const result = await comments.aggregate(query)
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  }
}
