import type { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import { StatusCodes } from 'http-status-codes'

const GUILD_ID = import.meta.env.DISCORD_GUILD || ''
const BOT_TOKEN = import.meta.env.DISCORD_BOT_TOKEN || ''

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    await axios.get(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${req.user?.discord}`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    })
    next()
  } catch {
    res.status(StatusCodes.FORBIDDEN).send({ success: false, message: 'Not in guild' })
  }
}
