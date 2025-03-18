import mongoose from 'mongoose'
import users from '../models/users'
import comments from '../models/comments'

export const getById = async (req, res) => {
  try {
    const result = await users.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id),
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
        $addFields: {
          patternCount: {
            $size: '$patterns',
          },
          skinCount: {
            $size: '$skins',
          },
        },
      },
      {
        $project: {
          patterns: 0,
          skins: 0,
          discord: 0,
        },
      },
    ])
    // some old users do not have this
    if (!result[0].avatar) {
      result[0].avatar =
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
    }
    const result2 = await comments.aggregate([
      {
        $match: {
          'replies.0.user': mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $count: 'replyCount',
      },
    ])
    res.status(200).send({ success: true, message: '', result: { ...result[0], ...result2[0] } })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}
