import type { TUserDocument } from '../models/user'
import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import passport from 'passport'

export const discordLogin = passport.authenticate('discord')

export const discordCallback = (req: Request, res: Response, next: NextFunction) => {
  // Authenticate with Discord
  passport.authenticate('discord', (error: unknown, user: TUserDocument | false) => {
    // Handle error
    if (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ success: false, message: 'Server Error' })
    }
    if (!user) {
      return res.redirect('/api/auth/login')
    }
    // Login
    req.logIn(user, (error) => {
      // Handle error
      if (error) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ success: false, message: 'Server Error' })
      }
      // Next middleware
      next()
    })
  })(req, res, next)
}

export const discordLogout = (req: Request, res: Response) => {
  req.logout(() => {
    res.clearCookie('connect.sid', { path: '/', httpOnly: true })
    req.session.destroy(() => {})
    return res.redirect('/')
  })
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' })
  }
}
