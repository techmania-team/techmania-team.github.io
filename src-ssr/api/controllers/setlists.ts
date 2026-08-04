import type { ISetlist } from '../models/setlist'
import type { Request, Response } from 'express'
import type { PipelineStage } from 'mongoose'
import { EmbedBuilder } from 'discord.js'
import { StatusCodes } from 'http-status-codes'
import _ from 'lodash'
import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'
import validator from 'validator'
import * as yup from 'yup'
import { CONTROLTYPE } from '@/utils/control'
import { CRITERIA, CRITERIA_DIRECTION } from '@/utils/criteria'
import Comment from '../models/comment'
import Pattern from '../models/pattern'
import Setlist from '../models/setlist'
import User from '../models/user'
import { AppError } from '../utils/error'
import { checkImage } from '../utils/image'
import { deleteWebhook, editWebhook, postWebhook, WEBHOOK_COLOR } from '../utils/webhook'

const buildSetlistEmbed = (setlist: ISetlist) => {
  let strPreveiw = ''
  for (const preview of setlist.previews) {
    strPreveiw += `${preview.name}\nhttps://www.youtube.com/watch?v=${preview.ytid}\n`
  }

  const ytid =
    setlist.previews.length > 0 && setlist.previews[0]!.ytid && setlist.previews[0]!.ytid.length > 0
      ? setlist.previews[0]!.ytid
      : ''

  const image =
    setlist.image.length > 0
      ? setlist.image
      : ytid.length > 0
        ? `https://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
        : import.meta.env.QCLI_HOST_URL + '/assets/unknown.jpg'

  const url = new URL(
    `/setlists/${setlist._id.toString()}`,
    import.meta.env.QCLI_HOST_URL,
  ).toString()

  const embed = new EmbedBuilder()
    .setURL(url)
    .setImage(image)
    .setTitle(setlist.name)
    .setColor(WEBHOOK_COLOR)
    .addFields([
      {
        name: 'Previews',
        value: strPreveiw || 'None',
        inline: false,
      },
      {
        name: 'Download',
        value: setlist.link,
        inline: false,
      },
      {
        name: 'Patterns',
        value: `Selectable: ${setlist.selectablePatterns.length}\nHidden:${setlist.hiddenPatterns.length}`,
        inline: false,
      },
    ])

  if (setlist.description) {
    const description = setlist.description.replace(/<[^>]+>/g, ' ').trim()
    embed.addFields({
      name: 'Description',
      value: description.length > 1000 ? description.substring(0, 1000) + '...' : description,
      inline: false,
    })
  }

  embed.addFields({
    name: 'More Info',
    value: url,
  })
  embed.setTimestamp()

  return embed
}

export const create = async (req: Request, res: Response) => {
  const user = req.user!

  // Request body validation schema
  const bodySchema = yup.object({
    name: yup.string().required(),
    link: yup.string().url().required(),
    image: yup
      .string()
      .required()
      .url()
      .test('valid', 'Invalid image URL', async (value) => {
        if (!value) return true
        return await checkImage(value)
      }),
    control: yup
      .number<CONTROLTYPE>()
      .required()
      .oneOf(Object.values(CONTROLTYPE) as number[]),
    selectablePatterns: yup
      .array()
      .required()
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
            const pattern = await Pattern.findById(value.pattern).orFail()
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
      .required()
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
            .number<CRITERIA>()
            .required()
            .oneOf(Object.values(CRITERIA) as number[]),
          criteriaDirection: yup
            .number<CRITERIA_DIRECTION>()
            .required()
            .oneOf(Object.values(CRITERIA_DIRECTION) as number[]),
          criteriaValue: yup.number().required().min(0),
        }),
      )
      .test('criteriaType', 'criteriaType Invalid', (value) => {
        // CRITERIA.NONE is only for the last hidden pattern
        return value.every((pattern, idx) => {
          return pattern.criteriaType !== CRITERIA.NONE || idx === value.length - 1
        })
      })
      .test('exists', 'Pattern not found', async (values) => {
        // Check pattern is exists in patterns collection
        // Check difficulty is exists in pattern
        try {
          for (const value of values) {
            const pattern = await Pattern.findById(value.pattern).orFail()
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
    previews: yup
      .array()
      .required()
      .of(
        yup.object().shape({
          name: yup.string().required(),
          ytid: yup.string().required(),
        }),
      ),
    description: yup
      .string()
      .required()
      .transform((value) => sanitizeHtml(value)),
  })
  // Parsed request query
  const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

  // Create setlist
  const result = await Setlist.create({ ...parseedBody, submitter: user._id })

  // Setup Discord webhook embed message
  const embed = buildSetlistEmbed(result)

  // Send Discord webhook message
  const id = await postWebhook(
    import.meta.env.DISCORD_WEBHOOK_SETLISTS!,
    `New setlist submitted by <@${user.discord}>`,
    [embed],
  )

  if (id) {
    result.webhook = id
    await result.save()
  }

  res.status(StatusCodes.OK).send({ success: true, message: '', _id: result._id })
}

export const search = async (req: Request, res: Response) => {
  // Request query validation schema
  const querySchema = yup.object().shape({
    start: yup.number().integer().min(0),
    limit: yup.number().integer().min(1),
    keysounded: yup.string().trim().oneOf(['0', '1', 'true', 'false', 'yes', 'no', undefined, '']),
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
        is: (value: string | undefined) => value !== undefined,
        then: (schema) => schema.required(),
      }),
    submitter: yup.string().test('mongoID', 'Invalid ID', (value) => {
      if (!value) return true
      return validator.isMongoId(value)
    }),
  })

  // Parsed request query
  const parseedQuery = await querySchema.validate(req.query, { stripUnknown: true })

  // Build dynamic $match conditions
  const matchCondition: Record<string, unknown> = {}

  if (parseedQuery.submitter) {
    matchCondition.submitter = new mongoose.Types.ObjectId(parseedQuery.submitter)
  }

  if (parseedQuery.keysounded) {
    if (['true', 'yes', '1'].includes(parseedQuery.keysounded)) {
      matchCondition.keysounded = true
    } else if (['false', 'no', '0'].includes(parseedQuery.keysounded)) {
      matchCondition.keysounded = false
    }
  }

  if (parseedQuery.controls) {
    matchCondition.control = {
      $in: parseedQuery.controls.split(',').map((control) => parseInt(control, 10)),
    }
  }

  // Keywords filter
  if (parseedQuery.keywords) {
    const orConditions: Record<string, unknown>[] = [{ $text: { $search: parseedQuery.keywords } }]

    const keywords = parseedQuery.keywords.match(
      /[^\s"']+|(?:"|'){2,}|"(?!")([^"]*)"|'(?!')([^']*)'|"|'/g,
    )
    if (keywords && keywords.length > 0) {
      const submittersRegex = keywords.map((k) => new RegExp(_.escapeRegExp(k), 'i'))
      const submittersID = await User.find({ name: { $in: submittersRegex } }, '_id')
      if (submittersID.length > 0) {
        orConditions.push({
          submitter: { $in: submittersID.map((submitterID) => submitterID._id) },
        })
      }
    }
    matchCondition.$or = orConditions
  }

  // Build aggregation pipeline
  const pipeline: PipelineStage[] = []

  if (Object.keys(matchCondition).length > 0) {
    pipeline.push({ $match: matchCondition })
  }

  pipeline.push(
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
  )

  // Sort stage
  const sortStage: Record<string, 1 | -1> = {}
  if (parseedQuery.sortBy) {
    const sortField = parseedQuery.sortBy === 'rating' ? 'rating.avg' : parseedQuery.sortBy
    sortStage[sortField] = (parseedQuery.sort as 1 | -1) || -1
  } else {
    sortStage.createdAt = -1
  }
  pipeline.push({ $sort: sortStage })

  // Skip & Limit stages
  if (parseedQuery.start) {
    pipeline.push({ $skip: parseedQuery.start })
  }
  if (parseedQuery.limit) {
    pipeline.push({ $limit: parseedQuery.limit })
  }

  // Submitter lookup & unset stages
  pipeline.push(
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
        'webhook',
      ],
    },
  )

  // Execute query
  const result = await Setlist.aggregate(pipeline)
  res.status(StatusCodes.OK).send({ success: true, message: '', result })
}

export const searchID = async (req: Request, res: Response) => {
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
  const result = await Setlist.aggregate([
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
    { $unset: ['comments', 'webhook'] },
  ])

  // Note:
  // Aggregation returns an array, but we only need the first element
  if (!result || result.length === 0) {
    throw new AppError('NOT_FOUND')
  }

  res.status(StatusCodes.OK).send({ success: true, message: '', result: result[0] })
}

export const del = async (req: Request, res: Response) => {
  const user = req.user!

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

  const setlist = await Setlist.findById(parsedParams.id).orFail()

  if (setlist.submitter.toString() !== user._id.toString()) {
    throw new AppError('PERMISSION')
  }

  // Delete pattern
  await Setlist.findByIdAndDelete(parsedParams.id)
  // Delete related comments
  await Comment.deleteMany({ setlist: parsedParams.id })

  if (setlist.webhook) {
    await deleteWebhook(import.meta.env.DISCORD_WEBHOOK_SETLISTS!, setlist.webhook)
  }

  res.status(StatusCodes.OK).send({ success: true, message: '' })
}

export const update = async (req: Request, res: Response) => {
  const user = req.user!

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
    control: yup
      .number<CONTROLTYPE>()
      .required()
      .oneOf(Object.values(CONTROLTYPE) as number[]),
    selectablePatterns: yup
      .array()
      .required()
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
            const pattern = await Pattern.findById(value.pattern).orFail()
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
      .required()
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
            .number<CRITERIA>()
            .required()
            .oneOf(Object.values(CRITERIA) as number[]),
          criteriaDirection: yup
            .number<CRITERIA_DIRECTION>()
            .required()
            .oneOf(Object.values(CRITERIA_DIRECTION) as number[]),
          criteriaValue: yup.number().required().min(0),
        }),
      )
      .test('criteriaType', 'criteriaType Invalid', (value) => {
        // CRITERIA.NONE is only for the last hidden pattern
        return value.every((pattern, idx) => {
          return pattern.criteriaType !== CRITERIA.NONE || idx === value.length - 1
        })
      })
      .test('exists', 'Pattern not found', async (values) => {
        // Check pattern is exists in patterns collection
        // Check difficulty is exists in pattern
        try {
          for (const value of values) {
            const pattern = await Pattern.findById(value.pattern).orFail()
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
    description: yup.string().transform((value) => sanitizeHtml(value)),
  })
  // Parsed request query
  const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

  // Update pattern
  const setlist = await Setlist.findById(parsedParams.id).orFail()

  if (setlist.submitter.toString() !== user._id.toString()) {
    throw new AppError('PERMISSION')
  }

  setlist.set(parseedBody)

  await setlist.save()

  if (setlist.webhook) {
    const embed = buildSetlistEmbed(setlist)
    await editWebhook(
      import.meta.env.DISCORD_WEBHOOK_SETLISTS!,
      setlist.webhook,
      `New setlist submitted by <@${user.discord}>`,
      [embed],
    )
  }

  res.status(StatusCodes.OK).send({ success: true, message: '' })
}
