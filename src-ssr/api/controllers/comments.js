import mongoose from 'mongoose'
import validator from 'validator'
import * as yup from 'yup'
import comments from '../models/comments'

export const create = async (req, res) => {
  try {
    // Request body validation schema
    const schema = yup.object({
      pattern: yup.string().test('mongoID', 'Invalid pattern ID', (value) => {
        // Allow empty value for mutual exclusion
        if (!value) return true
        return validator.isMongoId(value)
      }),
      skin: yup.string().test('mongoID', 'Invalid skin ID', (value) => {
        // Allow empty value for mutual exclusion
        if (!value) return true
        return validator.isMongoId(value)
      }),
      setlist: yup.string().test('mongoID', 'Invalid setlist ID', (value) => {
        // Allow empty value for mutual exclusion
        if (!value) return true
        return validator.isMongoId(value)
      }),
      rating: yup.number().required().min(1).max(5),
      comment: yup.string().required(),
    })
    // Parsed request body
    const parsedBody = await schema.validate(req.body, { stripUnknown: true })

    // Check if user already commented on the pattern or skin
    const checkQuery = {
      'replies.0.user': req.user._id,
      'replies.0.deleted': false,
    }
    if (parsedBody.pattern) {
      checkQuery.pattern = parsedBody.pattern
    } else if (parsedBody.skin) {
      checkQuery.skin = parsedBody.skin
    } else if (parsedBody.setlist) {
      checkQuery.setlist = parsedBody.setlist
    }
    let result = await comments.findOne(checkQuery)

    if (result) throw new Error('Already commented')

    // Create new comment
    const query = {
      replies: [
        {
          user: req.user._id,
          comment: parsedBody.comment,
        },
      ],
      rating: parsedBody.rating,
    }
    if (parsedBody.pattern) {
      query.pattern = parsedBody.pattern
    } else if (parsedBody.skin) {
      query.skin = parsedBody.skin
    } else if (parsedBody.setlist) {
      query.setlist = parsedBody.setlist
    }

    result = await comments.create(query)

    // Add user info to the result
    result = result.toObject()
    result.replies[0].user = {
      _id: req.user._id,
      avatar: `https://cdn.discordapp.com/avatars/${req.user.discord}/${req.user.avatar}.png`,
      name: req.user.name,
    }

    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    if (error.message === 'Already commented') {
      res.status(409).send({ success: false, message: 'Already commented' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const getByPattern = async (req, res) => {
  try {
    // Request params validation schema
    const paramsSchema = yup.object({
      pid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const query = [
      // Find matching pattern id
      {
        $match: {
          pattern: new mongoose.Types.ObjectId(parsedParams.pid),
          'replies.0.deleted': false,
        },
      },
      // Sort by comment date
      {
        $sort: {
          'replies.createdAt': -1,
        },
      },
      // Unwind replies for lookup
      {
        $unwind: {
          path: '$replies',
        },
      },
      // Match only non-deleted replies
      {
        $match: {
          'replies.deleted': false,
        },
      },
      // Lookup user
      {
        $lookup: {
          from: 'users',
          localField: 'replies.user',
          foreignField: '_id',
          as: 'replies.user',
          pipeline: [
            // Construct avatar URL
            {
              $addFields: {
                avatar: {
                  $concat: [
                    'https://cdn.discordapp.com/avatars/',
                    {
                      $toString: '$discord',
                    },
                    '/',
                    {
                      $toString: '$avatar',
                    },
                    '.png',
                  ],
                },
              },
            },
            // Remove unnecessary user fields
            {
              $project: {
                discord: 0,
                accessInfo: 0,
                discordToken: 0,
                discordRefreshToken: 0,
              },
            },
          ],
        },
      },
      // Unwind lookup result, always an array with 1 element
      {
        $unwind: {
          path: '$replies.user',
        },
      },
      // Calculate sum of votes and user's vote
      {
        $addFields: {
          // Sum of all votes
          'replies.votes.sum': {
            $sum: {
              $map: {
                input: {
                  $objectToArray: '$replies.votes',
                },
                as: 'voteEntry',
                in: '$$voteEntry.v',
              },
            },
          },
          // Get current user vote
          // 1: upvote, -1: downvote, 0: no vote
          'replies.votes.voted': {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $objectToArray: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              then: req.user
                ? {
                    $getField: {
                      field: { $toString: new mongoose.Types.ObjectId(req.user._id) },
                      input: '$replies.votes',
                    },
                  }
                : 0,
              else: 0,
            },
          },
        },
      },
      // Remove unnecessary fields in replies.votes
      {
        $project: {
          _id: 1,
          pattern: 1,
          rating: 1,
          'replies._id': 1,
          'replies.user': 1,
          'replies.comment': 1,
          'replies.createdAt': 1,
          'replies.updatedAt': 1,
          'replies.votes.sum': 1,
          'replies.votes.voted': 1,
        },
      },
      // Group pattern result back
      {
        $group: {
          _id: '$_id',
          pattern: {
            $first: '$pattern',
          },
          rating: {
            $first: '$rating',
          },
          replies: {
            $push: '$replies',
          },
        },
      },
    ]

    // User is logged in, exclude own replies
    // Own comments must be displayed first on the page, so we handle them separately
    if (req.user?._id) {
      query[0].$match['replies.0.user'] = {
        $not: {
          $eq: new mongoose.Types.ObjectId(req.user._id),
        },
      }
    }

    const result = await comments.aggregate(query)

    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const getMyCommmentByPattern = async (req, res) => {
  try {
    // Request params validation schema
    const paramsSchema = yup.object({
      pid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const query = [
      // Find matching pattern id
      {
        $match: {
          pattern: new mongoose.Types.ObjectId(parsedParams.pid),
          'replies.0.user': new mongoose.Types.ObjectId(req.user._id),
          'replies.0.deleted': false,
        },
      },
      // Sort by comment date
      {
        $sort: {
          'replies.createdAt': -1,
        },
      },
      // Unwind replies for lookup
      {
        $unwind: {
          path: '$replies',
        },
      },
      // Match only non-deleted replies
      {
        $match: {
          'replies.deleted': false,
        },
      },
      // Lookup user
      {
        $lookup: {
          from: 'users',
          localField: 'replies.user',
          foreignField: '_id',
          as: 'replies.user',
          pipeline: [
            // Construct avatar URL
            {
              $addFields: {
                avatar: {
                  $concat: [
                    'https://cdn.discordapp.com/avatars/',
                    {
                      $toString: '$discord',
                    },
                    '/',
                    {
                      $toString: '$avatar',
                    },
                    '.png',
                  ],
                },
              },
            },
            // Remove unnecessary user fields
            {
              $project: {
                discord: 0,
                accessInfo: 0,
                discordToken: 0,
                discordRefreshToken: 0,
              },
            },
          ],
        },
      },
      // Unwind lookup result, always an array with 1 element
      {
        $unwind: {
          path: '$replies.user',
        },
      },
      // Calculate sum of votes and user's vote
      {
        $addFields: {
          // Sum of all votes
          'replies.votes.sum': {
            $sum: {
              $map: {
                input: {
                  $objectToArray: '$replies.votes',
                },
                as: 'voteEntry',
                in: '$$voteEntry.v',
              },
            },
          },
          // Get current user vote
          // 1: upvote, -1: downvote, 0: no vote
          'replies.votes.voted': {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $objectToArray: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              then: {
                $ifNull: [
                  {
                    $getField: {
                      field: {
                        $toString: new mongoose.Types.ObjectId(req.user._id),
                      },
                      input: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              else: 0,
            },
          },
        },
      },
      // Remove unnecessary fields in replies.votes
      {
        $project: {
          _id: 1,
          pattern: 1,
          skin: 1,
          rating: 1,
          'replies._id': 1,
          'replies.user': 1,
          'replies.comment': 1,
          'replies.createdAt': 1,
          'replies.updatedAt': 1,
          'replies.votes.sum': 1,
          'replies.votes.voted': 1,
        },
      },
      // Group pattern result back
      {
        $group: {
          _id: '$_id',
          pattern: {
            $first: '$pattern',
          },
          rating: {
            $first: '$rating',
          },
          replies: {
            $push: '$replies',
          },
        },
      },
    ]

    const result = await comments.aggregate(query)

    if (result.length === 0) {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(200).send({ success: true, message: '', result: result[0] })
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const updateMyComment = async (req, res) => {
  try {
    // Request body validation schema
    const bodyschema = yup
      .object({
        comment: yup.string(),
        rating: yup.number().min(1).max(5),
        deleted: yup.boolean(),
      })
      .test('at-least-one', 'At least one field is required', (value) => {
        return value.comment || value.rating
      })
    // Parsed request body
    const parsedBody = await bodyschema.validate(req.body, { stripUnknown: true })

    // Request params validation schema
    const paramsSchema = yup.object({
      cid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    // Find comment with matching comment id
    const comment = await comments.findById(parsedParams.cid).orFail()

    // Check if user is the owner of the comment
    if (comment.replies[0].user.toString() !== req.user._id.toString()) {
      throw new Error('No permission')
    }

    if (parsedBody.deleted) {
      // Delete comment
      await comments.findByIdAndDelete(parsedParams.cid).orFail()
    } else {
      // Update comment
      if (parsedBody.comment) comment.replies[0].comment = parsedBody.comment
      if (parsedBody.rating) comment.rating = parsedBody.rating
      await comment.save()
    }

    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    if (error.message === 'No permission') {
      res.status(403).send({ success: false, message: 'No permission' })
    } else if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    }
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const createReply = async (req, res) => {
  try {
    // Request params validation schema
    const paramsSchema = yup.object({
      cid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    // Request body validation schema
    const bodySchema = yup.object({
      comment: yup.string().required(),
    })
    // Parsed request body
    const parsedBody = await bodySchema.validate(req.body, { stripUnknown: true })

    // Find comment with matching comment id
    const comment = await comments.findById(parsedParams.cid).orFail()
    // Create new reply
    const reply = {
      user: req.user._id,
      comment: parsedBody.comment,
    }
    comment.replies.push(reply)
    await comment.save()

    res
      .status(200)
      .send({ success: true, message: '', result: { ...comment.toObject().replies.pop() } })
  } catch (error) {
    if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const updateMyReply = async (req, res) => {
  try {
    const bodyschema = yup
      .object({
        comment: yup.string(),
        deleted: yup.boolean(),
      })
      .test('at-least-one', 'At least one field is required', (value) => {
        return value.comment || value.deleted
      })
    const parsedBody = await bodyschema.validate(req.body, { stripUnknown: true })

    const paramsSchema = yup.object({
      cid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
      rid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const $set = {}
    if (parsedBody.comment) $set['comment'] = parsedBody.comment
    if (parsedBody.deleted) $set['deleted'] = parsedBody.deleted

    // Find comment with matching comment id and reply id
    const comment = await comments
      .findOne({
        _id: new mongoose.Types.ObjectId(parsedParams.cid),
        'replies._id': new mongoose.Types.ObjectId(parsedParams.rid),
      })
      .orFail()

    // Check if user is the owner of the comment
    if (comment.replies.id(parsedParams.rid).user.toString() !== req.user._id.toString()) {
      throw new Error('No permission')
    }
    // Update comment
    comment.replies.id(parsedParams.rid).set($set)
    await comment.save()

    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    if (error.message === 'No permission') {
      res.status(403).send({ success: false, message: 'No permission' })
    } else if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const updateReplyVote = async (req, res) => {
  try {
    // Request body validation schema
    const bodySchema = yup.object({
      vote: yup.number().required().min(-1).max(1),
    })
    // Parsed request body
    const parsedBody = await bodySchema.validate(req.body, { stripUnknown: true })

    // Request params validation schema
    const paramsSchema = yup.object({
      cid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
      rid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    if (parsedBody.vote === 0) {
      // Delete vote
      await comments
        .findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(parsedParams.cid),
            'replies._id': new mongoose.Types.ObjectId(parsedParams.rid),
          },
          {
            $unset: {
              [`replies.$[a].votes.${req.user._id}`]: '',
            },
          },
          { arrayFilters: [{ 'a._id': new mongoose.Types.ObjectId(parsedParams.rid) }] },
        )
        .orFail()
    } else {
      // Update vote
      await comments
        .findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(parsedParams.cid),
            'replies._id': new mongoose.Types.ObjectId(parsedParams.rid),
          },
          {
            $set: {
              [`replies.$[a].votes.${req.user._id}`]: parsedBody.vote,
            },
          },
          { arrayFilters: [{ 'a._id': new mongoose.Types.ObjectId(parsedParams.rid) }] },
        )
        .orFail()
    }

    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const getBySkin = async (req, res) => {
  try {
    // Request params validation schema
    const paramsSchema = yup.object({
      sid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const query = [
      // Find matching skin id
      {
        $match: {
          skin: new mongoose.Types.ObjectId(parsedParams.sid),
          'replies.0.deleted': false,
        },
      },
      // Sort by comment date
      {
        $sort: {
          'replies.createdAt': -1,
        },
      },
      // Unwind replies for lookup
      {
        $unwind: {
          path: '$replies',
        },
      },
      // Match only non-deleted replies
      {
        $match: {
          'replies.deleted': false,
        },
      },
      // Lookup user
      {
        $lookup: {
          from: 'users',
          localField: 'replies.user',
          foreignField: '_id',
          as: 'replies.user',
          pipeline: [
            // Construct avatar URL
            {
              $addFields: {
                avatar: {
                  $concat: [
                    'https://cdn.discordapp.com/avatars/',
                    {
                      $toString: '$discord',
                    },
                    '/',
                    {
                      $toString: '$avatar',
                    },
                    '.png',
                  ],
                },
              },
            },
            // Remove unnecessary user fields
            {
              $project: {
                discord: 0,
                accessInfo: 0,
                discordToken: 0,
                discordRefreshToken: 0,
              },
            },
          ],
        },
      },
      // Unwind lookup result, always an array with 1 element
      {
        $unwind: {
          path: '$replies.user',
        },
      },
      // Calculate sum of votes and user's vote
      {
        $addFields: {
          // Sum of all votes
          'replies.votes.sum': {
            $sum: {
              $map: {
                input: {
                  $objectToArray: '$replies.votes',
                },
                as: 'voteEntry',
                in: '$$voteEntry.v',
              },
            },
          },
          // Get current user vote
          // 1: upvote, -1: downvote, 0: no vote
          'replies.votes.voted': {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $objectToArray: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              then: req.user
                ? {
                    $getField: {
                      field: { $toString: new mongoose.Types.ObjectId(req.user._id) },
                      input: '$replies.votes',
                    },
                  }
                : 0,
              else: 0,
            },
          },
        },
      },
      // Remove unnecessary fields in replies.votes
      {
        $project: {
          _id: 1,
          skin: 1,
          rating: 1,
          'replies._id': 1,
          'replies.user': 1,
          'replies.comment': 1,
          'replies.createdAt': 1,
          'replies.updatedAt': 1,
          'replies.votes.sum': 1,
          'replies.votes.voted': 1,
        },
      },
      // Group skin result back
      {
        $group: {
          _id: '$_id',
          skin: {
            $first: '$skin',
          },
          rating: {
            $first: '$rating',
          },
          replies: {
            $push: '$replies',
          },
        },
      },
    ]

    // User is logged in, exclude own replies
    // Own comments must be displayed first on the page, so we handle them separately
    if (req.user?._id) {
      query[0].$match['replies.0.user'] = {
        $not: {
          $eq: new mongoose.Types.ObjectId(req.user._id),
        },
      }
    }

    const result = await comments.aggregate(query)

    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const getMyCommmentBySkin = async (req, res) => {
  try {
    // Request params validation schema
    const paramsSchema = yup.object({
      sid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const query = [
      // Find matching pattern id
      {
        $match: {
          pattern: new mongoose.Types.ObjectId(parsedParams.sid),
          'replies.0.user': new mongoose.Types.ObjectId(req.user._id),
          'replies.0.deleted': false,
        },
      },
      // Sort by comment date
      {
        $sort: {
          'replies.createdAt': -1,
        },
      },
      // Unwind replies for lookup
      {
        $unwind: {
          path: '$replies',
        },
      },
      // Match only non-deleted replies
      {
        $match: {
          'replies.deleted': false,
        },
      },
      // Lookup user
      {
        $lookup: {
          from: 'users',
          localField: 'replies.user',
          foreignField: '_id',
          as: 'replies.user',
          pipeline: [
            // Construct avatar URL
            {
              $addFields: {
                avatar: {
                  $concat: [
                    'https://cdn.discordapp.com/avatars/',
                    {
                      $toString: '$discord',
                    },
                    '/',
                    {
                      $toString: '$avatar',
                    },
                    '.png',
                  ],
                },
              },
            },
            // Remove unnecessary user fields
            {
              $project: {
                discord: 0,
                accessInfo: 0,
                discordToken: 0,
                discordRefreshToken: 0,
              },
            },
          ],
        },
      },
      // Unwind lookup result, always an array with 1 element
      {
        $unwind: {
          path: '$replies.user',
        },
      },
      // Calculate sum of votes and user's vote
      {
        $addFields: {
          // Sum of all votes
          'replies.votes.sum': {
            $sum: {
              $map: {
                input: {
                  $objectToArray: '$replies.votes',
                },
                as: 'voteEntry',
                in: '$$voteEntry.v',
              },
            },
          },
          // Get current user vote
          // 1: upvote, -1: downvote, 0: no vote
          'replies.votes.voted': {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $objectToArray: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              then: {
                $ifNull: [
                  {
                    $getField: {
                      field: {
                        $toString: new mongoose.Types.ObjectId(req.user._id),
                      },
                      input: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              else: 0,
            },
          },
        },
      },
      // Remove unnecessary fields in replies.votes
      {
        $project: {
          _id: 1,
          pattern: 1,
          skin: 1,
          rating: 1,
          'replies._id': 1,
          'replies.user': 1,
          'replies.comment': 1,
          'replies.createdAt': 1,
          'replies.updatedAt': 1,
          'replies.votes.sum': 1,
          'replies.votes.voted': 1,
        },
      },
      // Group skin result back
      {
        $group: {
          _id: '$_id',
          skin: {
            $first: '$skin',
          },
          rating: {
            $first: '$rating',
          },
          replies: {
            $push: '$replies',
          },
        },
      },
    ]

    const result = await comments.aggregate(query)

    if (result.length === 0) {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(200).send({ success: true, message: '', result: result[0] })
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const getByUser = async (req, res) => {
  try {
    const paramsSchema = yup.object({
      uid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const querySchema = yup.object({
      start: yup.number().integer().min(0),
      limit: yup.number().integer().min(1),
    })
    const parseedQuery = await querySchema.validate(req.query, { stripUnknown: true })

    const query = [
      {
        $match: {
          'replies.0.user': new mongoose.Types.ObjectId(parsedParams.uid),
        },
      },
      { $skip: 0 },
      { $limit: 0 },
      {
        $project: {
          comment: {
            $first: '$replies.comment',
          },
          createdAt: {
            $first: '$replies.createdAt',
          },
          updatedAt: {
            $first: '$replies.updatedAt',
          },
          rating: '$rating',
          date: {
            $first: '$replies.createdAt',
          },
          pattern: '$pattern',
          skin: '$skin',
          setlist: '$setlist',
        },
      },
      {
        $lookup: {
          from: 'patterns',
          localField: 'pattern',
          foreignField: '_id',
          as: 'pattern',
          pipeline: [
            {
              $project: {
                composer: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$pattern',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'skins',
          localField: 'skin',
          foreignField: '_id',
          as: 'skin',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$skin',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'setlists',
          localField: 'setlist',
          foreignField: '_id',
          as: 'setlist',
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$setlist',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]

    // Add filters to query - Start
    if (parseedQuery.start) {
      query[1].$skip = parseedQuery.start
    }
    // Add filters to query - Limit
    if (parseedQuery.limit) {
      query[2].$limit = parseedQuery.limit
    } else {
      query.splice(2, 1)
    }

    const result = await comments.aggregate(query)

    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.error(error)
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const getBySetlist = async (req, res) => {
  try {
    // Request params validation schema
    const paramsSchema = yup.object({
      setid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const query = [
      // Find matching setlist id
      {
        $match: {
          setlist: new mongoose.Types.ObjectId(parsedParams.setid),
          'replies.0.deleted': false,
        },
      },
      // Sort by comment date
      {
        $sort: {
          'replies.createdAt': -1,
        },
      },
      // Unwind replies for lookup
      {
        $unwind: {
          path: '$replies',
        },
      },
      // Match only non-deleted replies
      {
        $match: {
          'replies.deleted': false,
        },
      },
      // Lookup user
      {
        $lookup: {
          from: 'users',
          localField: 'replies.user',
          foreignField: '_id',
          as: 'replies.user',
          pipeline: [
            // Construct avatar URL
            {
              $addFields: {
                avatar: {
                  $concat: [
                    'https://cdn.discordapp.com/avatars/',
                    {
                      $toString: '$discord',
                    },
                    '/',
                    {
                      $toString: '$avatar',
                    },
                    '.png',
                  ],
                },
              },
            },
            // Remove unnecessary user fields
            {
              $project: {
                discord: 0,
                accessInfo: 0,
                discordToken: 0,
                discordRefreshToken: 0,
              },
            },
          ],
        },
      },
      // Unwind lookup result, always an array with 1 element
      {
        $unwind: {
          path: '$replies.user',
        },
      },
      // Calculate sum of votes and user's vote
      {
        $addFields: {
          // Sum of all votes
          'replies.votes.sum': {
            $sum: {
              $map: {
                input: {
                  $objectToArray: '$replies.votes',
                },
                as: 'voteEntry',
                in: '$$voteEntry.v',
              },
            },
          },
          // Get current user vote
          // 1: upvote, -1: downvote, 0: no vote
          'replies.votes.voted': {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $objectToArray: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              then: req.user
                ? {
                    $getField: {
                      field: { $toString: new mongoose.Types.ObjectId(req.user._id) },
                      input: '$replies.votes',
                    },
                  }
                : 0,
              else: 0,
            },
          },
        },
      },
      // Remove unnecessary fields in replies.votes
      {
        $project: {
          _id: 1,
          setlist: 1,
          rating: 1,
          'replies._id': 1,
          'replies.user': 1,
          'replies.comment': 1,
          'replies.createdAt': 1,
          'replies.updatedAt': 1,
          'replies.votes.sum': 1,
          'replies.votes.voted': 1,
        },
      },
      // Group setlist result back
      {
        $group: {
          _id: '$_id',
          setlist: {
            $first: '$setlist',
          },
          rating: {
            $first: '$rating',
          },
          replies: {
            $push: '$replies',
          },
        },
      },
    ]

    // User is logged in, exclude own replies
    // Own comments must be displayed first on the page, so we handle them separately
    if (req.user?._id) {
      query[0].$match['replies.0.user'] = {
        $not: {
          $eq: new mongoose.Types.ObjectId(req.user._id),
        },
      }
    }

    const result = await comments.aggregate(query)

    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const getMyCommmentBySetlist = async (req, res) => {
  try {
    // Request params validation schema
    const paramsSchema = yup.object({
      setid: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const query = [
      // Find matching setlist id
      {
        $match: {
          setlist: new mongoose.Types.ObjectId(parsedParams.setid),
          'replies.0.user': new mongoose.Types.ObjectId(req.user._id),
          'replies.0.deleted': false,
        },
      },
      // Sort by comment date
      {
        $sort: {
          'replies.createdAt': -1,
        },
      },
      // Unwind replies for lookup
      {
        $unwind: {
          path: '$replies',
        },
      },
      // Match only non-deleted replies
      {
        $match: {
          'replies.deleted': false,
        },
      },
      // Lookup user
      {
        $lookup: {
          from: 'users',
          localField: 'replies.user',
          foreignField: '_id',
          as: 'replies.user',
          pipeline: [
            // Construct avatar URL
            {
              $addFields: {
                avatar: {
                  $concat: [
                    'https://cdn.discordapp.com/avatars/',
                    {
                      $toString: '$discord',
                    },
                    '/',
                    {
                      $toString: '$avatar',
                    },
                    '.png',
                  ],
                },
              },
            },
            // Remove unnecessary user fields
            {
              $project: {
                discord: 0,
                accessInfo: 0,
                discordToken: 0,
                discordRefreshToken: 0,
              },
            },
          ],
        },
      },
      // Unwind lookup result, always an array with 1 element
      {
        $unwind: {
          path: '$replies.user',
        },
      },
      // Calculate sum of votes and user's vote
      {
        $addFields: {
          // Sum of all votes
          'replies.votes.sum': {
            $sum: {
              $map: {
                input: {
                  $objectToArray: '$replies.votes',
                },
                as: 'voteEntry',
                in: '$$voteEntry.v',
              },
            },
          },
          // Get current user vote
          // 1: upvote, -1: downvote, 0: no vote
          'replies.votes.voted': {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $objectToArray: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              then: {
                $ifNull: [
                  {
                    $getField: {
                      field: {
                        $toString: new mongoose.Types.ObjectId(req.user._id),
                      },
                      input: '$replies.votes',
                    },
                  },
                  0,
                ],
              },
              else: 0,
            },
          },
        },
      },
      // Remove unnecessary fields in replies.votes
      {
        $project: {
          _id: 1,
          pattern: 1,
          setlist: 1,
          rating: 1,
          'replies._id': 1,
          'replies.user': 1,
          'replies.comment': 1,
          'replies.createdAt': 1,
          'replies.updatedAt': 1,
          'replies.votes.sum': 1,
          'replies.votes.voted': 1,
        },
      },
      // Group setlist result back
      {
        $group: {
          _id: '$_id',
          setlist: {
            $first: '$setlist',
          },
          rating: {
            $first: '$rating',
          },
          replies: {
            $push: '$replies',
          },
        },
      },
    ]

    const result = await comments.aggregate(query)

    if (result.length === 0) {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(200).send({ success: true, message: '', result: result[0] })
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}
