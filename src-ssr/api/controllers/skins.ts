import type { ISkin } from '../models/skin'
import type { Request, Response } from 'express'
import type { PipelineStage } from 'mongoose'
import { EmbedBuilder } from 'discord.js'
import { StatusCodes } from 'http-status-codes'
import _ from 'lodash'
import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'
import validator from 'validator'
import * as yup from 'yup'
import { SKINTYPE, SKINTYPES_CAPITALIZE } from '@/utils/skin'
import Comment from '../models/comment'
import Skin from '../models/skin'
import User from '../models/user'
import { AppError } from '../utils/error'
import { checkImage } from '../utils/image'
import { deleteWebhook, editWebhook, postWebhook, WEBHOOK_COLOR } from '../utils/webhook'

const buildSkinEmbed = (skin: ISkin) => {
  let strPreveiw = ''
  for (const preview of skin.previews) {
    strPreveiw += `${preview.name}\nhttps://www.youtube.com/watch?v=${preview.ytid}\n`
  }
  const ytid =
    skin.previews[0] && skin.previews[0].ytid && skin.previews[0].ytid.length > 0
      ? skin.previews[0].ytid
      : ''

  const image =
    skin.image.length > 0
      ? skin.image
      : ytid.length > 0
        ? `https://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
        : import.meta.env.QCLI_HOST_URL + '/assets/unknown.jpg'

  const url = new URL(`/skins/${skin._id.toString()}`, import.meta.env.QCLI_HOST_URL).toString()

  const embed = new EmbedBuilder()
    .setURL(url)
    .setImage(image)
    .setTitle(skin.name)
    .setColor(WEBHOOK_COLOR)
    .addFields(
      { name: 'Type', value: SKINTYPES_CAPITALIZE[skin.type]!, inline: false },
      { name: 'Previews', value: strPreveiw || 'None', inline: false },
      { name: 'Download', value: skin.link, inline: false },
    )

  if (skin.description) {
    const description = skin.description.replace(/<[^>]+>/g, ' ').trim()
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
    type: yup
      .number<SKINTYPE>()
      .required()
      .oneOf(Object.values(SKINTYPE) as number[]),
    description: yup
      .string()
      .notRequired()
      .transform((value) => sanitizeHtml(value)),
  })
  // Parsed request query
  const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

  // Create pattern
  const result = await Skin.create({
    ...parseedBody,
    image: parseedBody.image ?? '',
    previews: parseedBody.previews ?? [],
    description: parseedBody.description ?? '',
    submitter: user._id,
  })

  // Setup Discord webhook embed message
  const embed = buildSkinEmbed(result)
  // Send Discord webhook message
  const webhookId = await postWebhook(
    import.meta.env.DISCORD_WEBHOOK_SKINS || '',
    `New skin submitted by <@${user.discord}>`,
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

  if (parseedQuery.types) {
    matchCondition.type = {
      $in: parseedQuery.types.split(',').map((type) => parseInt(type, 10)),
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
  const result = await Skin.aggregate(pipeline)
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

  const result = await Skin.aggregate([
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
      $unset: ['comments', 'webhook'],
    },
  ])

  if (!result || result.length === 0) {
    throw new AppError('NOT_FOUND')
  }

  // Note:
  // Aggregation returns an array, but we only need the first element
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

  const skin = await Skin.findById(parsedParams.id).orFail()

  if (skin.submitter.toString() !== user._id.toString()) {
    throw new AppError('PERMISSION')
  }

  // Delete skin
  await Skin.findByIdAndDelete(parsedParams.id)
  // Delete related comments
  await Comment.deleteMany({ skin: parsedParams.id })
  // Delete webhook message
  if (skin.webhook) {
    await deleteWebhook(import.meta.env.DISCORD_WEBHOOK_SKINS || '', skin.webhook)
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
    type: yup
      .number<SKINTYPE>()
      .required()
      .oneOf(Object.values(SKINTYPE) as number[]),
    description: yup
      .string()
      .notRequired()
      .transform((value) => sanitizeHtml(value)),
  })
  // Parsed request query
  const parseedBody = await bodySchema.validate(req.body, { stripUnknown: true })

  // Update skin
  const skin = await Skin.findById(parsedParams.id).orFail()

  if (skin.submitter.toString() !== user._id.toString()) {
    throw new AppError('PERMISSION')
  }

  skin.set({
    ...parseedBody,
    image: parseedBody.image ?? '',
    previews: parseedBody.previews ?? [],
    description: parseedBody.description ?? '',
  })

  await skin.save()

  if (skin.webhook) {
    const embed = buildSkinEmbed(skin)
    await editWebhook(
      import.meta.env.DISCORD_WEBHOOK_SKINS || '',
      skin.webhook,
      `New skin submitted by <@${user.discord}>`,
      [embed],
    )
  }

  res.status(StatusCodes.OK).send({ success: true, message: '' })
}
