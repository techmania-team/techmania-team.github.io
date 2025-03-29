import mongoose from 'mongoose'
import * as yup from 'yup'
import validator from 'validator'
import users from '../models/users'

export const getById = async (req, res) => {
  try {
    // Request params validation schema
    const paramsSchema = yup.object({
      id: yup
        .string()
        .required()
        .test('mongoID', 'Invalid ID', (value) => {
          return validator.isMongoId(value)
        }),
    })
    // Parsed request params
    const parsedParams = await paramsSchema.validate(req.params, { stripUnknown: true })

    const result = await users.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(parsedParams.id),
        },
      },
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
      {
        $project: {
          name: 1,
          avatar: 1,
          discord: 1,
        },
      },
      {
        $lookup: {
          from: 'skins',
          localField: '_id',
          foreignField: 'submitter',
          as: 'skins',
        },
      },
      {
        $lookup: {
          from: 'patterns',
          localField: '_id',
          foreignField: 'submitter',
          as: 'patterns',
        },
      },
      {
        $lookup: {
          from: 'setlists',
          localField: '_id',
          foreignField: 'submitter',
          as: 'setlists',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'replies.user',
          as: 'comments',
        },
      },
      {
        $addFields: {
          patternCount: {
            $size: '$patterns',
          },
          skinCount: {
            $size: '$skins',
          },
          setlistCount: {
            $size: '$setlists',
          },
          replyCount: {
            $size: '$comments',
          },
        },
      },
      {
        $project: {
          patterns: 0,
          skins: 0,
          setlists: 0,
          discord: 0,
          comments: 0,
        },
      },
    ])

    // Only return the first result
    // Because we only find 1 user by ID
    res.status(200).send({ success: true, message: '', result: result[0] })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}
