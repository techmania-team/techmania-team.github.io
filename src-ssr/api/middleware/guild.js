import { REST, Routes } from 'discord.js'
import handleServerError from '../utils/handleServerError'
import { refreshAccessToken } from '../utils/discord'

const checkInGuild = async (accessToken) => {
  const rest = new REST({ version: '10' }).setToken(accessToken)
  const guilds = await rest.get(Routes.userGuilds(), { authPrefix: 'Bearer' })
  return guilds.some((guild) => guild.id.toString() === process.env.DISCORD_GUILD.toString())
}

export default async (req, res, next) => {
  try {
    let accessToken = req.user.accessToken
    let inGuild
    try {
      inGuild = await checkInGuild(accessToken)
    } catch (error) {
      if (req.user.refreshToken) {
        await refreshAccessToken(req)
        inGuild = await checkInGuild(accessToken)
      } else {
        throw error
      }
    }
    if (!inGuild) {
      res.status(403).send({ success: false, message: 'Not in guild' })
    } else {
      next()
    }
  } catch (error) {
    handleServerError(error)
    res.status(403).send({ success: false, message: 'Not in guild' })
  }
}
