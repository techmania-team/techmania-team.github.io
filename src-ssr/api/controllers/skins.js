import axios from 'axios'
import mongoose from 'mongoose'
import _ from 'lodash'
import validator from 'validator'
import * as yup from 'yup'
import skins from '../models/skins'
import users from '../models/users'
import { checkImage } from '../utils/image'
import { SKIN_NOTE, SKIN_VFX, SKIN_COMBO, SKIN_GAMEUI, SKIN_THEME } from 'src/utils/skin'

const types = ['Note', 'VFX', 'Combo', 'Game UI', 'Theme']

export const create = async (req, res) => {
  try {
    // Request body validation schema
    const bodySchema = yup.object({
      name: yup.string().required(),
      link: yup.string().url().required(),
      image: yup
        .string()
        .url()
        .test('valid', 'Invalid image URL', async (value) => {
          if (!value) return true
          return await checkImage(value)
        }),
      previews: yup.array().of(
        yup.object().shape({
          name: yup.string().required(),
          ytid: yup.string().required(),
        }),
      ),
      type: yup
        .number()
        .required()
        .oneOf([SKIN_NOTE, SKIN_VFX, SKIN_COMBO, SKIN_GAMEUI, SKIN_THEME]),
      description: yup.string(),
    })
    // Parsed request query
    const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

    // Create pattern
    const result = await skins.create({ ...parseedBody, submitter: req.user._id })

    // Setup Discord webhook embed message
    let strPreveiw = ''
    for (const preview of parseedBody.previews) {
      strPreveiw += `${preview.name}\nhttps://www.youtube.com/watch?v=${preview.ytid}\n`
    }
    const ytid =
      parseedBody.previews.length > 0 &&
      parseedBody.previews[0].ytid &&
      parseedBody.previews[0].ytid.length > 0
        ? parseedBody.previews[0].ytid
        : ''
    const embeds = [
      {
        url: new URL(`/skins/${result._id}`, process.env.HOST_URL).toString(),
        image: {
          url:
            parseedBody.image.length > 0
              ? parseedBody.image
              : ytid.length > 0
                ? `http://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
                : process.env.HOST_URL + '/assets/unknown.jpg',
        },
        title: parseedBody.name,
        color: '15158332',
        fields: [
          { name: 'Type', value: types[parseedBody.type], inline: true },
          { name: 'Previews', value: strPreveiw || 'None', inline: false },
          { name: 'Download', value: parseedBody.link, inline: false },
        ],
      },
    ]
    if (parseedBody.description) {
      embeds[0].fields.push({
        name: 'Description',
        value: parseedBody.description.replace(/<[^>]+>/g, ' '),
        inline: false,
      })
    }
    await axios.post(process.env.DISCORD_WEBHOOK_PATTERNS, {
      username: 'TECHMANIA',
      avatar_url: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
      content: `New skin submitted by <@${req.user.discord}>`,
      embeds,
    })
    res.status(200).send({ success: true, message: '', id: result._id })
  } catch (error) {
    console.error(error)
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const search = async (req, res) => {
  try {
    // Mongoose query
    const query = [
      {
        $match: {
          $or: [
            {
              $text: {
                $search: '',
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'skin',
          as: 'comments',
          pipeline: [
            {
              $project: {
                pattern: 0,
                skin: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          rating: {
            count: {
              $size: '$comments',
            },
            avg: {
              $ifNull: [
                {
                  $avg: '$comments.rating',
                },
                0,
              ],
            },
          },
        },
      },
      { $sort: {} },
      { $skip: 0 },
      { $limit: 0 },
      {
        $lookup: {
          from: 'users',
          localField: 'submitter',
          foreignField: '_id',
          as: 'submitter',
        },
      },
      {
        $unwind: {
          path: '$submitter',
        },
      },
      {
        $unset: [
          'submitter.discord',
          'submitter.avatar',
          'submitter.discordRefreshToken',
          'submitter.discordToken',
          'submitter.accessInfo',
          'comments',
        ],
      },
    ]

    // Request query validation schema
    const querySchema = yup.object().shape({
      start: yup.number().integer().min(0),
      limit: yup.number().integer().min(1),
      keywords: yup.string(),
      types: yup
        .string()
        .matches(
          /^(0|1|2|3|4)?(,(0|1|2|3|4))*$/,
          'Controls must be a comma-separated list of numbers between 0 and 2, without duplicates',
        )
        .test('unique', 'Controls values must be unique', (value) => {
          if (!value) return true
          const values = value.split(',')
          return new Set(values).size === values.length
        }),
      sortBy: yup.string().oneOf(['createdAt', 'updatedAt', 'name', 'rating']),
      sort: yup
        .number()
        .integer()
        .oneOf([1, -1])
        .when('sortBy', {
          is: (value) => value !== undefined,
          then: (schema) => schema.required(),
        }),
      submitter: yup.string().test('mongoID', 'Invalid ID', (value) => {
        if (!value) return true
        return validator.isMongoId(value)
      }),
    })
    // Parsed request query
    const parseedQuery = await querySchema.validate(req.query, { stripUnknown: true })

    // Add filters to query - Submitter
    if (parseedQuery.submitter) {
      query[0].$match.submitter = new mongoose.Types.ObjectId(req.query.submitter)
    }

    // Add filters to query - Types
    if ('types' in req.query) {
      query[0].$match.type = {
        $in: parseedQuery.types.split(',').map((type) => parseInt(type)),
      }
    }

    // Add filters to query - Keywords
    if (parseedQuery.keywords) {
      // Pattern keywords
      query[0].$match.$or[0].$text.$search = parseedQuery.keywords
      // Submitter keywords
      const submitters = []
      const keywords = req.query.keywords.match(
        /[^\s"']+|(?:"|'){2,}|"(?!")([^"]*)"|'(?!')([^']*)'|"|'/g,
      )
      for (const i in keywords) {
        let keyword = _.escapeRegExp(keywords[i])
        const re = new RegExp(keyword, 'i')
        submitters.push(re)
      }
      // Search users by regex name, and get their IDs
      const submittersID = await users.find({ name: { $in: submitters } }, '_id')
      // Add submitters to query
      query[0].$match.$or.push({
        submitter: { $in: submittersID.map((submitterID) => submitterID._id) },
      })
    }
    // Add filters to query - Start
    if (parseedQuery.start) {
      query[4].$skip = parseedQuery.start
    }
    // Add filters to query - Limit
    if (parseedQuery.limit) {
      query[5].$limit = parseedQuery.limit
    }
    // Add filters to query - Sort
    if (parseedQuery.sortBy) {
      if (parseedQuery.sortBy === 'rating') {
        parseedQuery.sortBy = 'rating.avg'
      }
      query[3].$sort[parseedQuery.sortBy] = parseedQuery.sort
    } else {
      query[3].$sort.createdAt = -1
    }

    // Remove unused query fields
    if (query[5].$limit === 0) {
      query.splice(5, 1)
    }
    if (query[0].$match.$or[0].$text.$search === '') {
      delete query[0].$match.$or.splice(0, 1)
    }
    if (query[0].$match.$or.length === 0) {
      delete query[0].$match.$or
    }

    // Execute query
    const result = await skins.aggregate(query)
    // Send response
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.error(error)
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: error.message })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const searchID = async (req, res) => {
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

    const result = await skins.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(parsedParams.id),
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'skin',
          as: 'comments',
          pipeline: [
            {
              $project: {
                pattern: 0,
                skin: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          rating: {
            count: {
              $size: '$comments',
            },
            avg: {
              $ifNull: [
                {
                  $avg: '$comments.rating',
                },
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'submitter',
          foreignField: '_id',
          as: 'submitter',
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
          path: '$submitter',
        },
      },
      {
        $unset: ['comments'],
      },
    ])

    if (!result || result.length === 0) {
      throw new mongoose.Error.DocumentNotFoundError()
    }

    // Note:
    // Aggregation returns an array, but we only need the first element
    res.status(200).send({ success: true, message: '', result: result[0] })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const del = async (req, res) => {
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

    const skin = await skins.findById(parsedParams.id).orFail()

    if (skin.submitter.toString() !== req.user._id.toString()) {
      throw new Error('Unauthorized')
    }

    await skins.findByIdAndDelete(parsedParams.id)

    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    console.error(error)
    if (error.message === 'Unauthorized') {
      res.status(403).send({ success: false, message: 'Unauthorized' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const update = async (req, res) => {
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

    // Request body validation schema
    const bodySchema = yup.object({
      name: yup.string().required(),
      link: yup.string().url().required(),
      image: yup
        .string()
        .url()
        .test('valid', 'Invalid image URL', async (value) => {
          if (!value) return true
          return await checkImage(value)
        }),
      previews: yup.array().of(
        yup.object().shape({
          name: yup.string().required(),
          ytid: yup.string().required(),
        }),
      ),
      type: yup
        .number()
        .required()
        .oneOf([SKIN_NOTE, SKIN_VFX, SKIN_COMBO, SKIN_GAMEUI, SKIN_THEME]),
      description: yup.string(),
    })
    // Parsed request query
    const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

    // Update skin
    const skin = await skins.findById(parsedParams.id).orFail()

    if (skin.submitter.toString() !== req.user._id.toString()) {
      throw new Error('Unauthorized')
    }

    skin.name = parseedBody.name
    skin.link = parseedBody.link
    skin.image = parseedBody.image
    skin.previews = parseedBody.previews
    skin.type = parseedBody.type
    skin.description = parseedBody.description

    await skin.save()

    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      res.status(403).send({ success: false, message: 'Unauthorized' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}
