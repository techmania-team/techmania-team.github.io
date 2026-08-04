import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export const getInfo = (req: Request, res: Response) => {
  const user = req.user!

  res.status(StatusCodes.OK).json({
    success: true,
    result: {
      _id: user._id,
      name: user.name,
      avatar: `https://cdn.discordapp.com/avatars/${user.discord}/${user.avatar}.png`,
    },
  })
}
