const axios = require('axios')
const mongoose = require('mongoose')
const _ = require('lodash')
const skins = require('../models/skins.js')
const users = require('../models/users.js')
const comments = require('../models/comments.js')
const { checkImage } = require('../utils')

const types = ['Note', 'VFX', 'Combo', 'Game UI']

module.exports = {
  async create (req, res) {
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
      const result = await skins.create({
        submitter: req.user._id,
        name: req.body.name,
        type: req.body.type,
        link: req.body.link,
        previews: req.body.previews,
        description: req.body.description,
        image: req.body.image
      })
      let strPreveiw = ''
      for (const preview of req.body.previews) {
        strPreveiw += `${preview.name}\nhttps://www.youtube.com/watch?v=${preview.ytid}\n`
      }
      const ytid = req.body.previews.length > 0 && req.body.previews[0].ytid && req.body.previews[0].ytid.length > 0 ? req.body.previews[0].ytid : ''
      const embeds = [{
        url: new URL(`/skins/${result._id}`, process.env.HOST_URL).toString(),
        image: { url: req.body.image.length > 0 ? req.body.image : ytid.length > 0 ? `http://i3.ytimg.com/vi/${ytid}/hqdefault.jpg` : process.env.HOST_URL + '/assets/unknown.jpg' },
        title: req.body.name,
        color: '15158332',
        fields: [
          { name: 'Type', value: types[req.body.type], inline: true },
          { name: 'Previews', value: strPreveiw || 'None', inline: false },
          { name: 'Download', value: req.body.link, inline: false }
        ]
      }]
      if (req.body.description) {
        embeds[0].fields.push({ name: 'Description', value: req.body.description.replace(/<[^>]+>/g, ' '), inline: false })
      }
      await axios.post(process.env.DISCORD_WEBHOOK_SKINS, {
        username: 'TECHMANIA',
        avatar_url: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
        content: `New skin submitted by <@${req.user.discord}>`,
        embeds
      })
      res.status(200).send({ success: true, message: '', id: result._id })
    } catch (error) {
      console.log(error)
      if (error.name === 'ValidationError') {
        res.status(400).send({ success: false, message: 'Validation Failed' })
      } else if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async search (req, res) {
    try {
      const query = [
        { $match: {} },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'skin',
            as: 'comments'
          }
        },
        {
          $addFields: {
            rating: {
              count: {
                $size: '$comments'
              },
              rating: {
                $ifNull: [{
                  $avg: '$comments.rating'
                },
                0
                ]
              }
            }
          }
        },
        { $sort: {} },
        { $skip: 0 },
        { $limit: 0 },
        {
          $lookup: {
            from: 'users',
            localField: 'submitter',
            foreignField: '_id',
            as: 'submitter'
          }
        },
        {
          $unwind: {
            path: '$submitter'
          }
        },
        {
          $unset: [
            'submitter.discord',
            'submitter.accessInfo',
            'submitter.avatar'
          ]
        }
      ]
      if (req.query.submitter) {
        query[0].$match.submitter = mongoose.Types.ObjectId(req.query.submitter)
      }
      if (req.query.start) {
        const start = parseInt(req.query.start)
        query[4].$skip = isNaN(start) ? 0 : start
      }
      if (req.query.limit) {
        const limit = parseInt(req.query.limit)
        if (limit >= 50 || isNaN(limit)) {
          res.status(400).send({ success: false, message: 'Invalid limit' })
          return
        }
        query[5].$limit = limit
      }
      if (req.query.keysounded === 'yes') {
        query[0].$match.keysounded = true
      } else if (req.query.keysounded === 'no') {
        query[0].$match.keysounded = false
      }
      if (req.query.control) {
        const control = parseInt(req.query.control)
        if (!isNaN(control) && control <= 2 && control >= 0) {
          query[0].$match['difficulties.control'] = control
        } else {
          res.status(400).send({ success: false, message: 'Invalid control' })
          return
        }
      }
      if (req.query.keywords) {
        query[0].$match.$or = []
        const keywords = req.query.keywords.match(/[^\s"']+|(?:"|'){2,}|"(?!")([^"]*)"|'(?!')([^']*)'|"|'/g)
        const names = []
        const composers = []
        const descriptions = []
        const submitters = []
        for (const i in keywords) {
          let keyword = _.escapeRegExp(keywords[i])
          if ((keyword[0] === '"' && keyword[keyword.length - 1] === '"') || (keyword[0] === '\'' && keyword[keyword.length - 1] === '\'')) {
            keyword = keyword.slice(1, -1)
          }
          const re = new RegExp(keyword, 'i')
          names.push(re)
          composers.push(re)
          descriptions.push(re)
          submitters.push(re)
        }
        query[0].$match.$or.push({ name: { $in: names } })
        query[0].$match.$or.push({ composer: { $in: composers } })
        query[0].$match.$or.push({ description: { $in: descriptions } })

        try {
          const submittersID = await users.find({ name: { $in: submitters } }, '_id')
          query[0].$match.$or.push({ submitter: { $in: submittersID } })
        } catch (_) {
        }
      }
      if (req.query.sortBy) {
        const querySort = parseInt(req.query.sort)
        if (isNaN(querySort) || (querySort !== 1 && querySort !== -1)) {
          res.status(400).send({ success: false, message: 'Invalid Sort' })
          return
        }
        const sortBy = req.query.sortBy
        if (sortBy !== 'submitDate' && sortBy !== 'updateDate' && sortBy !== 'name' && sortBy !== 'rating') {
          res.status(400).send({ success: false, message: 'Invalid SortBy' })
          return
        }
        query[3].$sort[sortBy] = querySort
      } else {
        query[3].$sort.submitDate = -1
      }
      const result = await skins.aggregate(query)
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      console.log(error)
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async searchID (req, res) {
    try {
      const result = await skins.findById(req.params.id).populate('submitter', 'name').lean()
      if (result === null) {
        res.status(404).send({ success: false, message: 'Not found' })
        return
      }
      const resultRating = await comments.aggregate([
        {
          $match: {
            skin: mongoose.Types.ObjectId(req.params.id)
          }
        },
        {
          $group: {
            _id: '$skin',
            rating: {
              $avg: '$rating'
            },
            count: {
              $sum: 1
            }
          }
        }
      ])
      result.rating = {
        rating: resultRating.length > 0 && resultRating[0].rating ? resultRating.length > 0 && resultRating[0].rating : 0,
        count: resultRating.length > 0 && resultRating[0].count ? resultRating.length > 0 && resultRating[0].count : 0
      }
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async del (req, res) {
    try {
      await skins.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params.id), submitter: req.user._id })
      res.status(200).send({ success: true, message: '' })
    } catch (error) {
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  },
  async update (req, res) {
    try {
      if (req.body.image && req.body.image.length > 0) {
        const valid = await checkImage(req.body.image)
        if (!valid) {
          res.status(400).send({ success: false, message: 'Validation Failed' })
          return
        }
      }
      await skins.findByIdAndUpdate(mongoose.Types.ObjectId(req.body._id), {
        submitter: req.user._id,
        name: req.body.name,
        type: req.body.type,
        link: req.body.link,
        previews: req.body.previews,
        description: req.body.description,
        image: req.body.image,
        updateDate: Date.now()
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
}
