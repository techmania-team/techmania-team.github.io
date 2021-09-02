const axios = require('axios')
const mongoose = require('mongoose')
const skins = require('../models/skins.js')
const users = require('../models/users.js')

const types = ['Note', 'VFX', 'Combo', 'Game UI']

module.exports = {
  async create (req, res) {
    try {
      const infoidx = req.user.accessInfo.findIndex(info => info.jwt === req.token)
      // check in discord guild or not
      const response = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${req.user.accessInfo[infoidx].discord}` }
      })
      const inGuild = response.data.find(guild => guild.id.toString() === process.env.DISCORD_GUILD.toString())
      if (!inGuild) {
        res.status(403).send({ success: false, message: 'Not in guild' })
        return
      } else {
        const result = await skins.create({
          submitter: req.user._id,
          name: req.body.name,
          type: req.body.type,
          link: req.body.link,
          previews: req.body.previews,
          description: req.body.description
        })
        let strPreveiw = ''
        for (const preview of req.body.previews) {
          strPreveiw += `https://www.youtube.com/watch?v=${preview.ytid}\n`
        }
        const embeds = [{
          url: new URL(`/skins/${result._id}`, process.env.HOST_URL).toString(),
          image: { url: `http://i3.ytimg.com/vi/${req.body.previews[0].ytid}/hqdefault.jpg` },
          title: req.body.name,
          color: '15158332',
          fields: [
            { name: 'Type', value: types[req.body.type], inline: true },
            { name: 'Previews', value: strPreveiw, inline: false },
            { name: 'Download', value: req.body.link, inline: false }
          ]
        }]
        if (req.body.description) {
          embeds[0].fields.push({ name: 'Description', value: req.body.description.replace(/&\S*;|<[^>]+>/g, ' '), inline: false })
        }
        await axios.post(process.env.DISCORD_WEBHOOK_SKINS, {
          username: 'TECHMANIA',
          avatar_url: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
          content: `New skin submitted by <@${req.user.discord}>`,
          embeds
        })
        res.status(200).send({ success: true, message: '', id: result._id })
      }
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
      const query = {}
      let skip = 0
      let limit = 0
      const sort = {}
      if (req.query.submitter) {
        query.submitter = mongoose.Types.ObjectId(req.query.submitter)
      }
      if (req.query.types) {
        if (req.query.types) {
          query.type = { $in: req.query.types.split(',').map(l => parseInt(l)) }
        }
      }
      if (req.query.start) {
        skip = parseInt(req.query.start)
        skip = isNaN(skip) ? 0 : skip
      }
      if (req.query.limit) {
        limit = parseInt(req.query.limit)
        if (limit >= 50 || isNaN(limit)) {
          res.status(400).send({ success: false, message: 'Invalid limit' })
          return
        }
      }
      if (req.query.keywords) {
        if (!query.$or) query.$or = []
        const keywords = req.query.keywords.match(/[^\s"']+|(?:"|'){2,}|"(?!")([^"]*)"|'(?!')([^']*)'|"|'/g)
        const names = []
        const composers = []
        const descriptions = []
        const submitters = []
        for (const i in keywords) {
          const re = new RegExp(keywords[i].replace(/"|'/g), 'i')
          names.push(re)
          composers.push(re)
          descriptions.push(re)
          submitters.push(re)
        }
        query.$or.push({ name: { $in: names } })
        query.$or.push({ composer: { $in: composers } })
        query.$or.push({ description: { $in: descriptions } })

        try {
          const submittersID = await users.find({ name: { $in: submitters } }, '_id')
          query.$or.push({ submitter: { $in: submittersID } })
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
        if (sortBy !== 'submitDate' && sortBy !== 'updateDate' && sortBy !== 'name') {
          res.status(400).send({ success: false, message: 'Invalid SortBy' })
          return
        }
        sort[sortBy] = querySort
      } else {
        sort.submitDate = -1
      }
      const result = await skins.find(query, {}, { skip, limit }).sort(sort).populate('submitter', 'name').lean()
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
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
      } else {
        res.status(200).send({ success: true, message: '', result })
      }
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
      const infoidx = req.user.accessInfo.findIndex(info => info.jwt === req.token)
      // check in discord guild or not
      const response = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${req.user.accessInfo[infoidx].discord}` }
      })
      const inGuild = response.data.find(guild => guild.id.toString() === process.env.DISCORD_GUILD.toString())
      if (!inGuild) {
        res.status(403).send({ success: false, message: 'Not in guild' })
        return
      } else {
        await skins.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params.id), submitter: req.user._id })
        res.status(200).send({ success: true, message: '' })
      }
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
      const infoidx = req.user.accessInfo.findIndex(info => info.jwt === req.token)
      // check in discord guild or not
      const response = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${req.user.accessInfo[infoidx].discord}` }
      })
      const inGuild = response.data.find(guild => guild.id.toString() === process.env.DISCORD_GUILD.toString())
      if (!inGuild) {
        res.status(403).send({ success: false, message: 'Not in guild' })
        return
      } else {
        await skins.findByIdAndUpdate(mongoose.Types.ObjectId(req.body._id), {
          submitter: req.user._id,
          name: req.body.name,
          type: req.body.type,
          link: req.body.link,
          previews: req.body.previews,
          description: req.body.description,
          updateDate: Date.now()
        })
        res.status(200).send({ success: true, message: '' })
      }
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
