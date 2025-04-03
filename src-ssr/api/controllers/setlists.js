import axios from 'axios'
import mongoose from 'mongoose'
import _ from 'lodash'
import * as yup from 'yup'
import { checkImage } from '../utils/image'
import validator from 'validator'
import setlists from '../models/setlists'
import patterns from '../models/patterns'
import comments from '../models/comments'
import users from '../models/users'
import { CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM } from 'src/utils/control'
import {
  CRITERIA_INDEX,
  CRITERIA_LEVEL,
  CRITERIA_HP,
  CRITERIA_SCORE,
  CRITERIA_COMBO,
  CRITERIA_MAX_COMBO,
  CRITERIA_D100,
  CRITERIA_NONE,
  CRITERIA_DIRECTION_LOWER,
  CRITERIA_DIRECTION_GREATER,
} from 'src/utils/criteria'
import handleServerError from '../utils/handleServerError'

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
      control: yup.number().typeError().required().oneOf([CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM]),
      selectablePatterns: yup
        .array()
        .of(
          yup.object().shape({
            pattern: yup
              .string()
              .required()
              .test('mongoID', 'Invalid ID', (value) => {
                return validator.isMongoId(value)
              }),
            difficulty: yup
              .string()
              .required()
              .test('mongoID', 'Invalid ID', (value) => {
                return validator.isMongoId(value)
              }),
          }),
        )
        .test('exists', 'Pattern not found', async (values) => {
          // Check pattern is exists in patterns collection
          // Check difficulty is exists in pattern
          try {
            for (const value of values) {
              const pattern = await patterns.findById(value.pattern).orFail()
              const difficulty = pattern.difficulties.id(value.difficulty)
              if (!difficulty) {
                return false
              }
            }
            return true
          } catch {
            return false
          }
        }),
      hiddenPatterns: yup
        .array()
        .of(
          yup.object().shape({
            pattern: yup
              .string()
              .required()
              .test('mongoID', 'Invalid ID', (value) => {
                return validator.isMongoId(value)
              }),
            difficulty: yup
              .string()
              .required()
              .test('mongoID', 'Invalid ID', (value) => {
                return validator.isMongoId(value)
              }),
            criteriaType: yup
              .number()
              .typeError()
              .required()
              .oneOf([
                CRITERIA_INDEX,
                CRITERIA_LEVEL,
                CRITERIA_HP,
                CRITERIA_SCORE,
                CRITERIA_COMBO,
                CRITERIA_MAX_COMBO,
                CRITERIA_D100,
                CRITERIA_NONE,
              ]),
            criteriaDirection: yup
              .number()
              .required()
              .oneOf([CRITERIA_DIRECTION_LOWER, CRITERIA_DIRECTION_GREATER]),
            criteriaValue: yup.number().typeError().required().min(0),
          }),
        )
        .test('criteriaType', 'criteriaType Invalid', (value) => {
          // CRITERIA_NONE is only for the last hidden pattern
          return value.every((pattern, idx) => {
            return pattern.criteriaType !== CRITERIA_NONE || idx === value.length - 1
          })
        })
        .test('exists', 'Pattern not found', async (values) => {
          // Check pattern is exists in patterns collection
          // Check difficulty is exists in pattern
          try {
            for (const value of values) {
              const pattern = await patterns.findById(value.pattern).orFail()
              const difficulty = pattern.difficulties.id(value.difficulty)
              if (!difficulty) {
                return false
              }
            }
            return true
          } catch {
            return false
          }
        }),
      previews: yup.array().of(
        yup.object().shape({
          name: yup.string().required(),
          ytid: yup.string().required(),
        }),
      ),
      description: yup.string(),
    })
    // Parsed request query
    const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

    // Create pattern
    const result = await setlists.create({ ...parseedBody, submitter: req.user._id })

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
        url: new URL(`/setlists/${result._id}`, process.env.HOST_URL).toString(),
        image: {
          url:
            parseedBody.image.length > 0
              ? parseedBody.image
              : ytid.length > 0
                ? `https://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
                : process.env.HOST_URL + '/assets/unknown.jpg',
        },
        title: parseedBody.name,
        color: '15158332',
        fields: [
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
    await axios.post(process.env.DISCORD_WEBHOOK_SETLISTS, {
      username: 'TECHMANIA',
      avatar_url: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
      content: `New setlist submitted by <@${req.user.discord}>`,
      embeds,
    })

    res.status(200).send({ success: true, message: '', _id: result._id })
  } catch (error) {
    handleServerError(error)
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
          foreignField: 'setlists',
          as: 'comments',
          pipeline: [
            {
              $project: {
                pattern: 0,
                skin: 0,
                setlist: 0,
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
      keysounded: yup
        .string()
        .trim()
        .oneOf(['0', '1', 'true', 'false', 'yes', 'no', undefined, '']),
      keywords: yup.string(),
      controls: yup
        .string()
        .matches(
          /^(0|1|2)?(,(0|1|2))*$/,
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
    // Add filters to query - Keysounded
    if (['true', 'yes', '1'].includes(parseedQuery.keysounded)) {
      query[0].$match.keysounded = true
    } else if (['false', 'no', '0'].includes(parseedQuery.keysounded)) {
      query[0].$match.keysounded = false
    }
    // Add filters to query - Controls
    if ('controls' in req.query) {
      query[0].$match.control = {
        $in: parseedQuery.controls.split(',').map((control) => parseInt(control)),
      }
    }
    // Add filters to query - Keywords
    if (parseedQuery.keywords) {
      // setlist keywords
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
    const result = await setlists.aggregate(query)
    // Send response
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    handleServerError(error)
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

    // Generated by Copilot Chat using Claude 3.7 Sonnet Model
    const result = await setlists.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(parsedParams.id),
        },
      },
      { $unwind: '$selectablePatterns' },
      {
        $lookup: {
          from: 'patterns',
          localField: 'selectablePatterns.pattern',
          foreignField: '_id',
          as: 'selectablePatternData',
        },
      },
      { $unwind: '$selectablePatternData' },
      {
        $addFields: {
          selectablePatterns: {
            $mergeObjects: [
              '$selectablePatternData',
              {
                difficulty: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$selectablePatternData.difficulties',
                        as: 'difficulty',
                        cond: { $eq: ['$$difficulty._id', '$selectablePatterns.difficulty'] },
                      },
                    },
                    0,
                  ],
                },
              },
            ],
          },
        },
      },
      { $unset: ['selectablePatterns.difficulties'] },
      {
        $group: {
          _id: '$_id',
          root: { $first: '$$ROOT' },
          selectablePatterns: { $push: '$selectablePatterns' },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', { selectablePatterns: '$selectablePatterns' }],
          },
        },
      },
      { $unwind: '$hiddenPatterns' },
      {
        $lookup: {
          from: 'patterns',
          localField: 'hiddenPatterns.pattern',
          foreignField: '_id',
          as: 'hiddenPatternData',
        },
      },
      { $unwind: '$hiddenPatternData' },
      {
        $addFields: {
          hiddenPatterns: {
            $mergeObjects: [
              '$hiddenPatternData',
              {
                difficulty: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$hiddenPatternData.difficulties',
                        as: 'difficulty',
                        cond: { $eq: ['$$difficulty._id', '$hiddenPatterns.difficulty'] },
                      },
                    },
                    0,
                  ],
                },
                criteriaType: '$hiddenPatterns.criteriaType',
                criteriaDirection: '$hiddenPatterns.criteriaDirection',
                criteriaValue: '$hiddenPatterns.criteriaValue',
              },
            ],
          },
        },
      },
      { $unset: ['hiddenPatterns.difficulties'] },
      {
        $group: {
          _id: '$_id',
          submitter: { $first: '$submitter' },
          name: { $first: '$name' },
          link: { $first: '$link' },
          previews: { $first: '$previews' },
          description: { $first: '$description' },
          image: { $first: '$image' },
          control: { $first: '$control' },
          selectablePatterns: { $first: '$selectablePatterns' },
          hiddenPatterns: { $push: '$hiddenPatterns' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'pattern',
          as: 'comments',
          pipeline: [{ $project: { setlist: 0 } }],
        },
      },
      {
        $addFields: {
          rating: {
            count: { $size: '$comments' },
            avg: { $ifNull: [{ $avg: '$comments.rating' }, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'submitter',
          foreignField: '_id',
          as: 'submitter',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $unwind: '$submitter' },
      { $unset: ['comments'] },
    ])

    // Note:
    // Aggregation returns an array, but we only need the first element
    if (!result || result.length === 0) {
      throw new mongoose.Error.DocumentNotFoundError()
    }

    res.status(200).send({ success: true, message: '', result: result[0] })
  } catch (error) {
    handleServerError(error)
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

    const pattern = await setlists.findById(parsedParams.id).orFail()

    if (pattern.submitter.toString() !== req.user._id.toString()) {
      throw new Error('Permission')
    }

    // Delete pattern
    await setlists.findByIdAndDelete(parsedParams.id)
    // Delete related comments
    await comments.deleteMany({ pattern: parsedParams.id })

    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    handleServerError(error)
    if (error.message === 'Permission') {
      res.status(403).send({ success: false, message: 'Permission' })
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
      control: yup.number().typeError().required().oneOf([CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM]),
      selectablePatterns: yup
        .array()
        .of(
          yup.object().shape({
            pattern: yup
              .string()
              .required()
              .test('mongoID', 'Invalid ID', (value) => {
                return validator.isMongoId(value)
              }),
            difficulty: yup
              .string()
              .required()
              .test('mongoID', 'Invalid ID', (value) => {
                return validator.isMongoId(value)
              }),
          }),
        )
        .test('exists', 'Pattern not found', async (values) => {
          // Check pattern is exists in patterns collection
          // Check difficulty is exists in pattern
          try {
            for (const value of values) {
              const pattern = await patterns.findById(value.pattern).orFail()
              const difficulty = pattern.difficulties.id(value.difficulty)
              return difficulty ? true : false
            }
            return true
          } catch {
            return false
          }
        }),
      hiddenPatterns: yup
        .array()
        .of(
          yup.object().shape({
            pattern: yup
              .string()
              .required()
              .test('mongoID', 'Invalid ID', (value) => {
                return validator.isMongoId(value)
              }),
            difficulty: yup
              .string()
              .required()
              .test('mongoID', 'Invalid ID', (value) => {
                return validator.isMongoId(value)
              }),
            criteriaType: yup
              .number()
              .typeError()
              .required()
              .oneOf([
                CRITERIA_INDEX,
                CRITERIA_LEVEL,
                CRITERIA_HP,
                CRITERIA_SCORE,
                CRITERIA_COMBO,
                CRITERIA_MAX_COMBO,
                CRITERIA_D100,
                CRITERIA_NONE,
              ]),
            criteriaDirection: yup
              .number()
              .required()
              .oneOf([CRITERIA_DIRECTION_LOWER, CRITERIA_DIRECTION_GREATER]),
            criteriaValue: yup.number().typeError().required().min(0),
          }),
        )
        .test('criteriaType', 'criteriaType Invalid', (value) => {
          // CRITERIA_NONE is only for the last hidden pattern
          return value.every((pattern, idx) => {
            return pattern.criteriaType !== CRITERIA_NONE || idx === value.length - 1
          })
        })
        .test('exists', 'Pattern not found', async (values) => {
          // Check pattern is exists in patterns collection
          // Check difficulty is exists in pattern
          try {
            for (const value of values) {
              const pattern = await patterns.findById(value.pattern).orFail()
              const difficulty = pattern.difficulties.id(value.difficulty)
              return difficulty ? true : false
            }
            return true
          } catch {
            return false
          }
        }),
      previews: yup.array().of(
        yup.object().shape({
          name: yup.string().required(),
          ytid: yup.string().required(),
        }),
      ),
      description: yup.string(),
    })
    // Parsed request query
    const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

    // Update pattern
    const setlist = await setlists.findById(parsedParams.id).orFail()

    if (setlist.submitter.toString() !== req.user._id.toString()) {
      throw new Error('Permission')
    }

    await setlists.findByIdAndUpdate(parsedParams.id, parseedBody).orFail()

    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    handleServerError(error)
    if (error.message === 'Permission') {
      res.status(403).send({ success: false, message: 'Permission' })
    } else if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}
