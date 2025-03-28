import axios from 'axios'
import mongoose from 'mongoose'
import * as yup from 'yup'
import { checkImage } from '../utils/image'
import validator from 'validator'
import setlists from '../models/setlists'
import patterns from '../models/patterns'
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
                ? `http://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
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
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
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
    if (error.name === 'ValidationError') {
      res.status(400).send({ success: false, message: 'Validation Failed' })
    } else if (error.name === 'CastError' || error.name === 'DocumentNotFoundError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}
