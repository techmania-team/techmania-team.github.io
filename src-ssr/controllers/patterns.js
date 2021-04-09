const axios = require('axios')
const mongoose = require('mongoose')
const patterns = require('../models/patterns.js')

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
          strDifficulty += `${controls[difficulty.control]} - ${difficulty.name}: lv.${difficulty.level}\n`
        }
        await axios.post(process.env.DISCORD_WEBHOOK, {
          username: 'TECHMANIA',
          avatar_url: 'https://avatars.githubusercontent.com/u/77661148?s=200&v=4',
          content: `New pattern submitted by <@${req.user.discord}>`,
          embeds: [{
            url: new URL(`/patterns/${result._id}`, process.env.HOST_URL).toString(),
            image: { url: `http://i3.ytimg.com/vi/${req.body.previews[0].ytid}/hqdefault.jpg` },
            title: req.body.name,
            color: '15158332',
            fields: [
              { name: 'Composer', value: req.body.composer, inline: true },
              { name: 'Keysounded', value: req.body.keysounded === true ? 'Yes' : 'No', inline: true },
              { name: 'Previews', value: strPreveiw, inline: false },
              { name: 'Difficulties', value: strDifficulty, inline: false },
              { name: 'Download', value: req.body.link, inline: false },
              { name: 'Description', value: req.body.description, inline: false }
            ]
          }]
        })
        res.status(200).send({ success: true, message: '' })
      }
    } catch (error) {
      console.log(error)
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  },
  async search (req, res) {
    try {
      const query = {}
      if (req.query.submitter) {
        query.submitter = mongoose.Types.ObjectId(req.query.submitter)
      }
      const result = await patterns.find(query).populate('submitter', 'name').lean()
      res.status(200).send({ success: true, message: '', result })
    } catch (error) {
      console.log(error)
      res.status(500).send({ success: false, message: 'Server Error' })
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
      res.status(500).send({ success: false, message: 'Server Error' })
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
      console.log(error)
      res.status(500).send({ success: false, message: 'Server Error' })
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
        await patterns.findOneAndUpdate({
          _id: mongoose.Types.ObjectId(req.params.id),
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
      console.log(error)
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}
