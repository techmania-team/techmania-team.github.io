const mongoose = require('mongoose')
const comments = require('../models/comments.js')
const patterns = require('../models/patterns.js')
const skins = require('../models/skins.js')

module.exports = {
  async create (req, res) {
    try {
      const query = {
        pattern: req.body.pattern,
        'replies.0.user': req.user._id,
        'replies.0.deleted': false
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
            pattern: mongoose.Types.ObjectId(req.params.id),
            'replies.0.deleted': false
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
            'replies.0.user': req.user._id,
            'replies.0.deleted': false
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
      await comments.findOneAndUpdate({
        _id: req.params.id,
        'replies.0.user': req.user._id
      }, {
        rating: req.body.rating,
        $set: {
          'replies.0.comment': req.body.comment,
          'replies.0.updateDate': Date.now()
        }
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
      const comment = await comments.findById(mongoose.Types.ObjectId(req.params.cid))
      if (!comment) return res.status(404).send({ success: false, message: 'Not found' })
      const pattern = await patterns.findById(comment.pattern)
      if (!pattern) return res.status(404).send({ success: false, message: 'Not found' })
      if (comment.replies[0].user.toString() !== req.user._id.toString() && comment.replies[0].user !== pattern.submitter) {
        return res.status(403).send({ success: false, message: 'No permission' })
      }
      comment.replies.push({
        user: mongoose.Types.ObjectId(req.user._id),
        comment: req.body.comment
      })
      comment.markModified('replies')
      await comment.save()
      res.status(200).send({ success: true, message: '', result: { ...comment.toObject().replies.pop() } })
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
  async updateReply (req, res) {
    try {
      const $set = {
        'replies.$[a].updateDate': Date.now()
      }
      if (req.body.deleted !== undefined) $set['replies.$[a].deleted'] = req.body.deleted
      if (req.body.comment) $set['replies.$[a].comment'] = req.body.comment
      await comments.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.cid),
          'replies._id': mongoose.Types.ObjectId(req.params.rid),
          'replies.user': req.user._id
        },
        { $set },
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
          rating: result.length > 0 && result[0].rating ? result.length > 0 && result[0].rating : 0,
          count: result.length > 0 && result[0].count ? result.length > 0 && result[0].count : 0
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
          rating: result.length > 0 && result[0].rating ? result.length > 0 && result[0].rating : 0,
          count: result.length > 0 && result[0].count ? result.length > 0 && result[0].count : 0
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
  },
  async deleteMyComment (req, res) {
    try {
      await comments.findOneAndDelete({ _id: req.params.cid, 'replies.0.user': req.user._id })
      res.status(200).send({ success: true, message: '' })
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async getByUser (req, res) {
    try {
      const query = [
        {
          $match: {
            'replies.0.user': mongoose.Types.ObjectId(req.params.id)
          }
        },
        { $skip: 0 },
        { $limit: 12 },
        {
          $project: {
            comment: {
              $first: '$replies.comment'
            },
            rating: '$rating',
            date: {
              $first: '$replies.date'
            },
            pattern: '$pattern'
          }
        },
        {
          $lookup: {
            from: 'patterns',
            localField: 'pattern',
            foreignField: '_id',
            as: 'pattern'
          }
        },
        {
          $unwind: {
            path: '$pattern'
          }
        }
      ]
      if (req.query.start) {
        const start = parseInt(req.query.start)
        query[1].$skip = isNaN(start) ? 0 : start
      }
      if (req.query.limit) {
        const limit = parseInt(req.query.limit)
        if (limit >= 50 || isNaN(limit)) {
          res.status(400).send({ success: false, message: 'Invalid limit' })
          return
        }
        query[2].$limit = limit
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
