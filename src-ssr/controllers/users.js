const jwt = require('jsonwebtoken')
const axios = require('axios')
const FormData = require('form-data')
const users = require('../models/users.js')

module.exports = {
  async login (req, res) {
    const code = req.query.code
    if (code) {
      try {
        // use code to exchange token
        const fd = new FormData()
        fd.append('grant_type', 'authorization_code')
        fd.append('client_id', process.env.DISCORD_CLIENT.replace(/abc/g, ''))
        fd.append('client_secret', process.env.DISCORD_SECRET)
        fd.append('code', code)
        fd.append('redirect_uri', new URL('/api/users/login', process.env.HOST_URL).toString())
        fd.append('scope', 'identify guilds')
        let response = await axios.post('https://discord.com/api/oauth2/token', fd, {
          headers: fd.getHeaders()
        })
        const accessToken = response.data.access_token
        const refreshToken = response.data.refresh_token

        // get user data and insert into database
        response = await axios.get('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })

        let user = await users.findOne({
          discord: response.data.id
        })

        if (user === null) {
          user = await users.create({
            discord: response.data.id,
            name: response.data.username,
            accessInfo: []
          })
        }

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '5 days' })
        user.name = response.data.username
        user.accessInfo.push({
          jwt: token,
          discord: accessToken,
          discordRefresh: refreshToken
        })
        await user.save()
        res.redirect(new URL(`?token=${accessToken}&jwt=${token}`, process.env.HOST_URL).toString())
      } catch (error) {
        if (error.response) {
          console.log(error.response.data)
        } else console.log(error)
        res.status(500).send({ success: false, message: 'Server Error' })
      }
    } else {
      res.status(400).send({ success: false, message: 'Bad Request' })
    }
  },
  async extend (req, res) {
    try {
      // refresh discord token
      const infoidx = req.user.accessInfo.findIndex(info => info.jwt === req.token)
      const fd = new FormData()
      fd.append('grant_type', 'refresh_token')
      fd.append('client_id', process.env.DISCORD_CLIENT.replace(/abc/g, ''))
      fd.append('client_secret', process.env.DISCORD_SECRET)
      fd.append('refresh_token', req.user.accessInfo[infoidx].discordRefresh)
      fd.append('redirect_uri', new URL('/api/users/login', process.env.HOST_URL).toString())
      fd.append('scope', 'identify guilds')
      const response = await axios.post('https://discord.com/api/oauth2/token', fd, {
        headers: fd.getHeaders()
      })
      const accessToken = response.data.access_token
      const refreshToken = response.data.refresh_token

      const token = jwt.sign({ _id: req.user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '5 days' })
      req.user.accessInfo[infoidx].discord = accessToken
      req.user.accessInfo[infoidx].discordRefresh = refreshToken
      req.user.accessInfo[infoidx].jwt = token
      await req.user.save()

      res.status(200).send({ success: true, message: '', jwt: token, token: accessToken })
    } catch (error) {
      console.log(error)
      res.status(500).send({ success: true, message: 'Server Error' })
    }
  },
  async logout (req, res) {
    try {
      const infoidx = req.user.accessInfo.findIndex(info => info.jwt === req.token)
      const fd = new FormData()
      fd.append('token', req.user.accessInfo[infoidx].discord)
      fd.append('client_id', process.env.DISCORD_CLIENT.replace(/abc/g, ''))
      fd.append('client_secret', process.env.DISCORD_SECRET)
      await axios.post('https://discord.com/api/oauth2/token/revoke', fd, {
        headers: fd.getHeaders()
      })

      req.user.accessInfo.splice(infoidx, 1)
    } catch (_) {
    }
    res.status(200).send({ success: true, message: '' })
  }
}
