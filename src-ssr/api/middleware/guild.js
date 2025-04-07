import { REST, Routes } from 'discord.js'
import handleServerError from '../utils/handleServerError'

export default async (req, res, next) => {
  try {
    // check in discord guild or not
    const rest = new REST({ version: '10' }).setToken(req.user.accessToken)
    const guilds = await rest.get(Routes.userGuilds(), { authPrefix: 'Bearer' })
    const inGuild = guilds.some(
      (guild) => guild.id.toString() === process.env.DISCORD_GUILD.toString(),
    )
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
