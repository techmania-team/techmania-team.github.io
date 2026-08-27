import type { IPattern } from '../models/pattern'
import type { Request, Response } from 'express'
import type { PipelineStage } from 'mongoose'
import { EmbedBuilder } from 'discord.js'
import { StatusCodes } from 'http-status-codes'
import _ from 'lodash'
import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'
import validator from 'validator'
import * as yup from 'yup'
import { controls_capitalize, CONTROLTYPE } from '@/utils/control'
import Comment from '../models/comment'
import Pattern from '../models/pattern'
import User from '../models/user'
import { AppError } from '../utils/error'
import { checkImage } from '../utils/image'
import { deleteWebhook, editWebhook, postWebhook, WEBHOOK_COLOR } from '../utils/webhook'

const buildPatternEmbed = (pattern: IPattern) => {
  let strPreveiw = ''
  for (const preview of pattern.previews) {
    strPreveiw += `${preview.name}\nhttps://www.youtube.com/watch?v=${preview.ytid}\n`
  }

  let strDifficulty = ''
  for (const difficulty of pattern.difficulties) {
    strDifficulty += `${controls_capitalize[difficulty.control]} / ${difficulty.lanes}L / ${difficulty.name} / lv.${difficulty.level}\n`
  }
  const ytid =
    pattern.previews[0] && pattern.previews[0].ytid && pattern.previews[0].ytid.length > 0
      ? pattern.previews[0].ytid
      : ''

  const image =
    pattern.image.length > 0
      ? pattern.image
      : ytid.length > 0
        ? `https://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
        : import.meta.env.QCLI_HOST_URL || '' + '/assets/unknown.jpg'

  const url = new URL(
    `/patterns/${pattern._id.toString()}`,
    import.meta.env.QCLI_HOST_URL || '',
  ).toString()

  const embed = new EmbedBuilder()
    .setURL(url)
    .setImage(image)
    .setTitle(pattern.name)
    .setColor(WEBHOOK_COLOR)
    .addFields(
      { name: 'Composer', value: pattern.composer, inline: false },
      {
        name: 'Keysounded',
        value: pattern.keysounded === true ? 'Yes' : 'No',
        inline: false,
      },
      { name: 'Previews', value: strPreveiw || 'None', inline: false },
      { name: 'Difficulties', value: strDifficulty, inline: false },
      { name: 'Download', value: pattern.link, inline: false },
    )

  if (pattern.description) {
    const description = pattern.description.replace(/<[^>]+>/g, ' ').trim()
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
    composer: yup.string().required(),
    link: yup.string().url().required(),
    keysounded: yup.boolean().required(),
    image: yup
      .string()
      .notRequired()
      .test('is-valid-url-or-empty', 'Invalid image URL', (value) => {
        if (!value) return true
        return yup.string().url().isValidSync(value)
      })
      .test('valid', 'Invalid image URL', async (value) => {
        if (!value) return true
        return await checkImage(value)
      }),
    previews: yup
      .array()
      .notRequired()
      .default([])
      .of(
        yup.object().shape({
          name: yup.string().required(),
          ytid: yup.string().required(),
        }),
      ),
    difficulties: yup
      .array()
      .required()
      .of(
        yup.object().shape({
          name: yup.string().required(),
          level: yup.number().required().min(1),
          control: yup
            .number<CONTROLTYPE>()
            .required()
            .oneOf(Object.values(CONTROLTYPE) as number[]),
          lanes: yup.number().required().min(2).max(4),
        }),
      ),
    description: yup
      .string()
      .notRequired()
      .transform((value) => sanitizeHtml(value)),
  })
  // Parsed request query
  const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

  // Create pattern
  const result = await Pattern.create({
    ...parseedBody,
    image: parseedBody.image ?? '',
    previews: parseedBody.previews ?? [],
    description: parseedBody.description ?? '',
    submitter: user._id,
  })

  // Setup Discord webhook embed message
  const embed = buildPatternEmbed(result)

  // Send Discord webhook message
  const webhookId = await postWebhook(
    import.meta.env.DISCORD_WEBHOOK_PATTERNS || '',
    `New pattern submitted by <@${user.discord}>`,
    [embed],
  )
  // Save Discord webhook message ID if successful
  if (webhookId) {
    result.webhook = webhookId
    await result.save()
  }
  res.status(StatusCodes.OK).send({ success: true, message: '', result: result._id })
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
    lanes: yup
      .string()
      .matches(
        /^(2|3|4)?(,(2|3|4))*$/,
        'Lanes must be a comma-separated list of numbers between 2 and 4, without duplicates',
      )
      .test('unique', 'Lanes values must be unique', (value) => {
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

  // Difficulties filter (controls & lanes)
  const diffConditions: Record<string, unknown> = {}
  if (parseedQuery.controls) {
    diffConditions.control = {
      $in: parseedQuery.controls.split(',').map((control) => parseInt(control, 10)),
    }
  }
  if (parseedQuery.lanes) {
    diffConditions.lanes = {
      $in: parseedQuery.lanes.split(',').map((lane) => parseInt(lane, 10)),
    }
  }
  if (Object.keys(diffConditions).length > 0) {
    matchCondition.difficulties = { $elemMatch: diffConditions }
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
        foreignField: 'pattern',
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
  const result = await Pattern.aggregate(pipeline)
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

  const result = await Pattern.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(parsedParams.id),
      },
    },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'pattern',
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
      $unset: ['comments', 'webhook'],
    },
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

  const pattern = await Pattern.findById(parsedParams.id).orFail()

  if (pattern.submitter.toString() !== user._id.toString()) {
    throw new Error('PERMISSION')
  }

  // Delete pattern
  await Pattern.findByIdAndDelete(parsedParams.id)
  // Delete related comments
  await Comment.deleteMany({ pattern: parsedParams.id })
  // Delete webhook message
  if (pattern.webhook) {
    await deleteWebhook(import.meta.env._PATTERNS || '', pattern.webhook)
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
    composer: yup.string().required(),
    link: yup.string().url().required(),
    keysounded: yup.boolean().required(),
    image: yup
      .string()
      .notRequired()
      .test('is-valid-url-or-empty', 'Invalid image URL', (value) => {
        if (!value) return true
        return yup.string().url().isValidSync(value)
      })
      .test('valid', 'Invalid image URL', async (value) => {
        if (!value) return true
        return await checkImage(value)
      }),
    previews: yup
      .array()
      .notRequired()
      .default([])
      .of(
        yup.object().shape({
          name: yup.string().required(),
          ytid: yup.string().required(),
        }),
      ),
    difficulties: yup
      .array()
      .required()
      .of(
        yup.object().shape({
          name: yup.string().required(),
          level: yup.number().required().min(1),
          control: yup
            .number<CONTROLTYPE>()
            .required()
            .oneOf(Object.values(CONTROLTYPE) as number[]),
          lanes: yup.number().required().min(2).max(4),
        }),
      ),
    description: yup
      .string()
      .notRequired()
      .transform((value) => sanitizeHtml(value)),
  })
  // Parsed request query
  const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

  // Update pattern
  const pattern = await Pattern.findById(parsedParams.id).orFail()

  if (pattern.submitter.toString() !== user._id.toString()) {
    throw new AppError('PERMISSION')
  }

  pattern.set({
    ...parseedBody,
    image: parseedBody.image ?? '',
    previews: parseedBody.previews ?? [],
    description: parseedBody.description ?? '',
  })

  await pattern.save()

  if (pattern.webhook) {
    const embed = buildPatternEmbed(pattern)
    await editWebhook(
      import.meta.env.DISCORD_WEBHOOK_PATTERNS || '',
      pattern.webhook,
      `New pattern submitted by <@${user.discord}>`,
      [embed],
    )
  }

  res.status(StatusCodes.OK).send({ success: true, message: '' })
}
