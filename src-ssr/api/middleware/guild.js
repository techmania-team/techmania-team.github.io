import axios from 'axios'

export default async (req, res, next) => {
  try {
    // check in discord guild or not
    const response = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${req.user.accessToken}` },
    })
    const inGuild = response.data.find(
      (guild) => guild.id.toString() === process.env.DISCORD_GUILD.toString(),
    )
    if (!inGuild) {
      res.status(403).send({ success: false, message: 'Not in guild' })
    } else {
      next()
    }
  } catch (error) {
    console.error(error)
    res.status(403).send({ success: false, message: 'Not in guild' })
  }
}
