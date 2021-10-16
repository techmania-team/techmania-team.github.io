const axios = require('axios')
const mongoose = require('mongoose')
const patterns = require('../models/patterns.js')
const users = require('../models/users.js')

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
        const result = await patterns.create({
          submitter: req.user._id,
          name: req.body.name,
          composer: req.body.composer,
          keysounded: req.body.keysounded,
          difficulties: req.body.difficulties,
          link: req.body.link,
          previews: req.body.previews,
          description: req.body.description
        })
        let strPreveiw = ''
        for (const preview of req.body.previews) {
          strPreveiw += `https://www.youtube.com/watch?v=${preview.ytid}\n`
        }
        const controls = ['Touch', 'Key', 'KM']
        let strDifficulty = ''
        for (const difficulty of req.body.difficulties) {
          strDifficulty += `${controls[difficulty.control]} / ${difficulty.lanes}L / ${difficulty.name} / lv.${difficulty.level}\n`
        }
        const embeds = [{
          url: new URL(`/patterns/${result._id}`, process.env.HOST_URL).toString(),
          image: { url: `http://i3.ytimg.com/vi/${req.body.previews[0].ytid}/hqdefault.jpg` },
          title: req.body.name,
          color: '15158332',
          fields: [
            { name: 'Composer', value: req.body.composer, inline: true },
            { name: 'Keysounded', value: req.body.keysounded === true ? 'Yes' : 'No', inline: true },
            { name: 'Previews', value: strPreveiw, inline: false },
            { name: 'Difficulties', value: strDifficulty, inline: false },
            { name: 'Download', value: req.body.link, inline: false }
          ]
        }]
        if (req.body.description) {
          embeds[0].fields.push({ name: 'Description', value: req.body.description.replace(/&\S*;|<[^>]+>/g, ' '), inline: false })
        }
        await axios.post(process.env.DISCORD_WEBHOOK_PATTERNS, {
          username: 'TECHMANIA',
          avatar_url: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
          content: `New pattern submitted by <@${req.user.discord}>`,
          embeds
        })
        res.status(200).send({ success: true, message: '', id: result._id })
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
      if (req.query.keysounded === 'yes') {
        query.keysounded = true
      } else if (req.query.keysounded === 'no') {
        query.keysounded = false
      }
      if (req.query.control) {
        const control = parseInt(req.query.control)
        if (!isNaN(control) && control <= 2 && control >= 0) {
          query['difficulties.control'] = control
        } else {
          res.status(400).send({ success: false, message: 'Invalid control' })
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
      if (req.query.lanes) {
        query.difficulties = { $elemMatch: { lanes: { $in: req.query.lanes.split(',').map(l => parseInt(l)) } } }
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
      const result = await patterns.find(query, {}, { skip, limit }).sort(sort).populate('submitter', 'name').lean()
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
      const result = await patterns.findById(req.params.id).populate('submitter', 'name').lean()
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
        await patterns.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params.id), submitter: req.user._id })
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
        await patterns.findByIdAndUpdate(mongoose.Types.ObjectId(req.body._id), {
          submitter: req.user._id,
          name: req.body.name,
          composer: req.body.composer,
          keysounded: req.body.keysounded,
          difficulties: req.body.difficulties,
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
  },
  async indexvideo (req, res) {
    try {
      const result = await patterns.aggregate([
        { $unwind: '$previews' },
        { $project: { ytid: '$previews.ytid' } },
        { $sample: { size: 2 } }
      ])
      result.unshift({ _id: '', ytid: 'rplTTHaEoPw' })
      result.unshift({ _id: '', ytid: 'PCfQ-6ZYyxY' })
      result.unshift({ _id: '', ytid: '3a3XRaqvsWc' })
      result.unshift({ _id: '', ytid: 'czRzORpQy3U' })
      result.unshift({ _id: '', ytid: '1v_LVASKrsQ' })
      result.unshift({ _id: '', ytid: 'MtkxhEmCWwU' })
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      console.log(error)
      if (error.name === 'CastError') {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    }
  }
}
