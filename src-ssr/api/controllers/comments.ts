import type { Request, Response } from 'express'
import type { PipelineStage, Types } from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import validator from 'validator'
import * as yup from 'yup'
import Comment from '../models/comment'
import { AppError } from '../utils/error'

interface ICheckCommentQuery {
  'replies.0.user': Types.ObjectId
  'replies.0.deleted': boolean
  pattern?: string
  skin?: string
  setlist?: string
}

export const create = async (req: Request, res: Response) => {
  const user = req.user!

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

  // Check if user already commented on the pattern, skin or setlist
  const checkCommentQuery: ICheckCommentQuery = {
    'replies.0.user': user._id,
    'replies.0.deleted': false,
  }
  if (parsedBody.pattern) {
    checkCommentQuery.pattern = parsedBody.pattern
  } else if (parsedBody.skin) {
    checkCommentQuery.skin = parsedBody.skin
  } else if (parsedBody.setlist) {
    checkCommentQuery.setlist = parsedBody.setlist
  }
  const existingComment = await Comment.findOne(checkCommentQuery)

  if (existingComment) throw new AppError('ALREADY_COMMENTED')

  // Create new comment
  const createQuery: Record<string, unknown> = {
    replies: [
      {
        user: user._id,
        comment: parsedBody.comment,
      },
    ],
    rating: parsedBody.rating,
  }
  if (parsedBody.pattern) {
    createQuery.pattern = parsedBody.pattern
  } else if (parsedBody.skin) {
    createQuery.skin = parsedBody.skin
  } else if (parsedBody.setlist) {
    createQuery.setlist = parsedBody.setlist
  }

  const result = await Comment.create(createQuery)

  const resultObj = result.toObject()
  delete (resultObj as { __v?: number }).__v

  res.status(StatusCodes.OK).send({
    success: true,
    message: '',
    result: {
      ...resultObj,
      replies: [
        {
          ...resultObj.replies[0],
          user: {
            _id: user._id,
            name: user.name,
            avatar: `https://cdn.discordapp.com/avatars/${user.discord}/${user.avatar}.png`,
          },
          votes: {
            sum: 0,
            voted: 0,
          },
        },
      ],
    },
  })
}

export const getByPattern = async (req: Request, res: Response) => {
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

  const initialMatch: Record<string, unknown> = {
    pattern: new mongoose.Types.ObjectId(parsedParams.pid),
    'replies.0.deleted': false,
  }

  // User is logged in, exclude own replies
  // Own comments must be displayed first on the page, so we handle them separately
  if (req.user?._id) {
    initialMatch['replies.0.user'] = {
      $not: {
        $eq: new mongoose.Types.ObjectId(req.user._id),
      },
    }
  }

  const query: PipelineStage[] = [
    // Find matching pattern id
    {
      $match: initialMatch,
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

  const result = await Comment.aggregate(query)

  res.status(StatusCodes.OK).send({ success: true, message: '', result })
}

export const getMyCommmentByPattern = async (req: Request, res: Response) => {
  const user = req.user!

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

  const query: PipelineStage[] = [
    // Find matching pattern id
    {
      $match: {
        pattern: new mongoose.Types.ObjectId(parsedParams.pid),
        'replies.0.user': new mongoose.Types.ObjectId(user._id),
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
                      $toString: new mongoose.Types.ObjectId(user._id),
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

  const result = await Comment.aggregate(query)

  if (result.length === 0) {
    throw new AppError('NOT_FOUND')
  } else {
    res.status(StatusCodes.OK).send({ success: true, message: '', result: result[0] })
  }
}

export const updateMyComment = async (req: Request, res: Response) => {
  const user = req.user!

  // Request body validation schema
  const bodyschema = yup
    .object({
      comment: yup.string(),
      rating: yup.number().min(1).max(5),
      deleted: yup.boolean(),
    })
    .required()
    .test('at-least-one', 'At least one field is required', (value) => {
      return Boolean(value.comment || value.rating || value.deleted)
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
  const comment = await Comment.findById(parsedParams.cid).orFail()

  // Check if user is the owner of the comment
  if (comment.replies[0]!.user.toString() !== user._id.toString()) {
    throw new AppError('PERMISSION')
  }

  if (parsedBody.deleted) {
    // Delete comment
    await Comment.findByIdAndDelete(parsedParams.cid).orFail()
  } else {
    // Update comment
    if (parsedBody.comment) comment.replies[0]!.comment = parsedBody.comment
    if (parsedBody.rating) comment.rating = parsedBody.rating
    await comment.save()
  }

  res.status(StatusCodes.OK).send({ success: true, message: '' })
}

export const createReply = async (req: Request, res: Response) => {
  const user = req.user!

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
  const comment = await Comment.findById(parsedParams.cid).orFail()
  // Create new reply
  const reply = {
    user: user._id,
    comment: parsedBody.comment,
  }
  comment.replies.push(reply)
  await comment.save()

  res
    .status(200)
    .send({ success: true, message: '', result: { ...comment.toObject().replies.pop() } })
}

export const updateMyReply = async (req: Request, res: Response) => {
  const user = req.user!

  const bodyschema = yup
    .object({
      comment: yup.string().required(),
    })
    .required()
  const parsedBody = await bodyschema.validate(req.body, { stripUnknown: true })

  const paramsSchema = yup.object({
    cid: yup
      .string()
      .required()
      .test('mongoID', 'Invalid ID', (value) => validator.isMongoId(value)),
    rid: yup
      .string()
      .required()
      .test('mongoID', 'Invalid ID', (value) => validator.isMongoId(value)),
  })
  const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

  // Find comment with matching comment id and reply id
  const comment = await Comment.findOne({
    _id: new mongoose.Types.ObjectId(parsedParams.cid),
    'replies._id': new mongoose.Types.ObjectId(parsedParams.rid),
  }).orFail()

  const reply = comment.replies.id(parsedParams.rid)
  if (!reply) throw new AppError('REPLY_NOT_FOUND')

  // Check if user is the owner of the comment
  if (reply.user.toString() !== user._id.toString()) {
    throw new AppError('PERMISSION')
  }

  // Update comment
  reply.set({ comment: parsedBody.comment })
  await comment.save()

  res.status(StatusCodes.OK).send({ success: true, message: '' })
}

export const deleteMyReply = async (req: Request, res: Response) => {
  const user = req.user!

  const paramsSchema = yup.object({
    cid: yup
      .string()
      .required()
      .test('mongoID', 'Invalid ID', (value) => validator.isMongoId(value)),
    rid: yup
      .string()
      .required()
      .test('mongoID', 'Invalid ID', (value) => validator.isMongoId(value)),
  })
  const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

  // Find comment with matching comment id and reply id
  const comment = await Comment.findOne({
    _id: new mongoose.Types.ObjectId(parsedParams.cid),
    'replies._id': new mongoose.Types.ObjectId(parsedParams.rid),
  }).orFail()

  const reply = comment.replies.id(parsedParams.rid)
  if (!reply) throw new AppError('REPLY_NOT_FOUND')

  // Check if user is the owner of the comment
  if (reply.user.toString() !== user._id.toString()) {
    throw new AppError('PERMISSION')
  }

  if (comment.replies[0]?._id.toString() === parsedParams.rid) {
    await Comment.findByIdAndDelete(parsedParams.cid).orFail()
  } else {
    reply.set({ deleted: true })
    await comment.save()
  }

  res.status(StatusCodes.OK).send({ success: true, message: '' })
}

export const updateReplyVote = async (req: Request, res: Response) => {
  const user = req.user!

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
    await Comment.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(parsedParams.cid),
        'replies._id': new mongoose.Types.ObjectId(parsedParams.rid),
      },
      {
        $unset: {
          [`replies.$[a].votes.${user.id}`]: '',
        },
      },
      { arrayFilters: [{ 'a._id': new mongoose.Types.ObjectId(parsedParams.rid) }] },
    ).orFail()
  } else {
    // Update vote
    await Comment.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(parsedParams.cid),
        'replies._id': new mongoose.Types.ObjectId(parsedParams.rid),
      },
      {
        $set: {
          [`replies.$[a].votes.${user.id}`]: parsedBody.vote,
        },
      },
      { arrayFilters: [{ 'a._id': new mongoose.Types.ObjectId(parsedParams.rid) }] },
    ).orFail()
  }

  res.status(StatusCodes.OK).send({ success: true, message: '' })
}

export const getBySkin = async (req: Request, res: Response) => {
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

  const initialMatch: Record<string, unknown> = {
    skin: new mongoose.Types.ObjectId(parsedParams.sid),
    'replies.0.deleted': false,
  }

  // User is logged in, exclude own replies
  // Own comments must be displayed first on the page, so we handle them separately
  if (req.user?._id) {
    initialMatch['replies.0.user'] = {
      $not: {
        $eq: new mongoose.Types.ObjectId(req.user._id),
      },
    }
  }

  const query: PipelineStage[] = [
    // Find matching skin id
    {
      $match: initialMatch,
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

  const result = await Comment.aggregate(query)

  res.status(StatusCodes.OK).send({ success: true, message: '', result })
}

export const getMyCommmentBySkin = async (req: Request, res: Response) => {
  const user = req.user!

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

  const query: PipelineStage[] = [
    // Find matching pattern id
    {
      $match: {
        pattern: new mongoose.Types.ObjectId(parsedParams.sid),
        'replies.0.user': new mongoose.Types.ObjectId(user._id),
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
                      $toString: new mongoose.Types.ObjectId(user._id),
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

  const result = await Comment.aggregate(query)

  if (result.length === 0) {
    throw new AppError('NOT_FOUND')
  } else {
    res.status(StatusCodes.OK).send({ success: true, message: '', result: result[0] })
  }
}

export const getByUser = async (req: Request, res: Response) => {
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

  const pipeline: PipelineStage[] = [
    {
      $match: {
        'replies.0.user': new mongoose.Types.ObjectId(parsedParams.uid),
      },
    },
  ]

  if (parseedQuery.start) {
    pipeline.push({ $skip: parseedQuery.start })
  }
  if (parseedQuery.limit) {
    pipeline.push({ $limit: parseedQuery.limit })
  }

  pipeline.push(
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
  )

  const result = await Comment.aggregate(pipeline)

  res.status(StatusCodes.OK).send({ success: true, message: '', result })
}

export const getBySetlist = async (req: Request, res: Response) => {
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

  const initialMatch: Record<string, unknown> = {
    setlist: new mongoose.Types.ObjectId(parsedParams.setid),
    'replies.0.deleted': false,
  }

  // User is logged in, exclude own replies
  // Own comments must be displayed first on the page, so we handle them separately
  if (req.user?._id) {
    initialMatch['replies.0.user'] = {
      $not: {
        $eq: new mongoose.Types.ObjectId(req.user._id),
      },
    }
  }

  const query: PipelineStage[] = [
    // Find matching setlist id
    {
      $match: initialMatch,
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

  const result = await Comment.aggregate(query)

  res.status(StatusCodes.OK).send({ success: true, message: '', result })
}

export const getMyCommmentBySetlist = async (req: Request, res: Response) => {
  const user = req.user!

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

  const query: PipelineStage[] = [
    // Find matching setlist id
    {
      $match: {
        setlist: new mongoose.Types.ObjectId(parsedParams.setid),
        'replies.0.user': new mongoose.Types.ObjectId(user._id),
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
                      $toString: new mongoose.Types.ObjectId(user._id),
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

  const result = await Comment.aggregate(query)

  if (result.length === 0) {
    throw new AppError('NOT_FOUND')
  } else {
    res.status(StatusCodes.OK).send({ success: true, message: '', result: result[0] })
  }
}
