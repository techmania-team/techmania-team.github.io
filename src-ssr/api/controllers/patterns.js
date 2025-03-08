import axios from 'axios'
import mongoose from 'mongoose'
import _ from 'lodash'
import * as yup from 'yup'
import patterns from '../models/patterns.js'
import users from '../models/users.js'
import { checkImage } from '../utils/image'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    if (req.body.image && req.body.image.length > 0) {
      const valid = await checkImage(req.body.image)
      if (!valid) {
        res.status(400).send({ success: false, message: 'Validation Failed' })
        return
      }
    } else {
      req.body.image = ''
    }
    const result = await patterns.create({
      submitter: req.user._id,
      name: req.body.name,
      composer: req.body.composer,
      keysounded: req.body.keysounded,
      difficulties: req.body.difficulties,
      link: req.body.link,
      previews: req.body.previews,
      description: req.body.description,
      image: req.body.image,
    })
    let strPreveiw = ''
    for (const preview of req.body.previews) {
      strPreveiw += `${preview.name}\nhttps://www.youtube.com/watch?v=${preview.ytid}\n`
    }
    const controls = ['Touch', 'Key', 'KM']
    let strDifficulty = ''
    for (const difficulty of req.body.difficulties) {
      strDifficulty += `${controls[difficulty.control]} / ${difficulty.lanes}L / ${difficulty.name} / lv.${difficulty.level}\n`
    }
    const ytid =
      req.body.previews.length > 0 &&
      req.body.previews[0].ytid &&
      req.body.previews[0].ytid.length > 0
        ? req.body.previews[0].ytid
        : ''
    const embeds = [
      {
        url: new URL(`/patterns/${result._id}`, process.env.HOST_URL).toString(),
        image: {
          url:
            req.body.image.length > 0
              ? req.body.image
              : ytid.length > 0
                ? `http://i3.ytimg.com/vi/${ytid}/hqdefault.jpg`
                : process.env.HOST_URL + '/assets/unknown.jpg',
        },
        title: req.body.name,
        color: '15158332',
        fields: [
          { name: 'Composer', value: req.body.composer, inline: true },
          {
            name: 'Keysounded',
            value: req.body.keysounded === true ? 'Yes' : 'No',
            inline: true,
          },
          { name: 'Previews', value: strPreveiw || 'None', inline: false },
          { name: 'Difficulties', value: strDifficulty, inline: false },
          { name: 'Download', value: req.body.link, inline: false },
        ],
      },
    ]
    if (req.body.description) {
      embeds[0].fields.push({
        name: 'Description',
        value: req.body.description.replace(/<[^>]+>/g, ' '),
        inline: false,
      })
    }
    await axios.post(process.env.DISCORD_WEBHOOK_PATTERNS, {
      username: 'TECHMANIA',
      avatar_url: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
      content: `New pattern submitted by <@${req.user.discord}>`,
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
        $unset: ['submitter.discord', 'submitter.avatar'],
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
      query[0].$match.submitter = mongoose.Types.ObjectId(req.query.submitter)
    }
    // Add filters to query - Keysounded
    if (['true', 'yes', '1'].includes(parseedQuery.keysounded)) {
      query[0].$match.keysounded = true
    } else if (['false', 'no', '0'].includes(parseedQuery.keysounded)) {
      query[0].$match.keysounded = false
    }
    // Add filters to query - Control
    console.log('controls', parseedQuery.controls)
    if (parseedQuery.controls) {
      query[0].$match.difficulties = {
        $elemMatch: {
          control: { $in: parseedQuery.controls.split(',').map((control) => parseInt(control)) },
        },
      }
    }
    // Add filters to query - Lanes
    if (parseedQuery.lanes) {
      const lanesQuery = { $in: parseedQuery.lanes.split(',').map((lane) => parseInt(lane)) }

      if (!query[0].$match.difficulties) {
        query[0].$match.difficulties = {
          $elemMatch: {
            lanes: lanesQuery,
          },
        }
      } else {
        query[0].$match.difficulties.$elemMatch.lanes = lanesQuery
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
        parseedQuery.sortBy = 'rating.rating'
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
    console.log(JSON.stringify(query, null, 2))
    const result = await patterns.aggregate(query)
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
    const result = await patterns.findById(req.params.id).populate('submitter', 'name').lean()
    if (result === null) {
      res.status(404).send({ success: false, message: 'Not found' })
      return
    }
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

export const del = async (req, res) => {
  try {
    await patterns.findOneAndDelete({
      _id: mongoose.Types.ObjectId(req.params.id),
      submitter: req.user._id,
    })
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: 'Not found' })
    } else {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}

export const update = async (req, res) => {
  try {
    if (req.body.image && req.body.image.length > 0) {
      const valid = await checkImage(req.body.image)
      if (!valid) {
        res.status(400).send({ success: false, message: 'Validation Failed' })
        return
      }
    }
    await patterns.findByIdAndUpdate(mongoose.Types.ObjectId(req.body._id), {
      name: req.body.name,
      composer: req.body.composer,
      keysounded: req.body.keysounded,
      difficulties: req.body.difficulties,
      link: req.body.link,
      previews: req.body.previews,
      description: req.body.description,
      image: req.body.image,
      updatedAt: Date.now(),
    })
    res.status(200).send({ success: true, message: '' })
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
