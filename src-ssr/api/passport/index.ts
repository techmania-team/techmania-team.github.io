import type { ISessionUser } from '../types/session'
import type { Express } from 'express'
import passport from 'passport'
import User from '../models/user'
import discord from './discord'

export const initialize = (app: Express) => {
  // Set up passport
  app.use('/api', passport.initialize())
  app.use('/api', passport.session())

  // Use Discord strategy
  passport.use('discord', discord)

  // Save user info to the session
  passport.serializeUser((user, done) => {
    const sessionUser: ISessionUser = {
      _id: user.id,
      name: user.name,
      avatar: `https://cdn.discordapp.com/avatars/${user.discord}/${user.avatar}.png`,
    }
    done(null, sessionUser)
  })

  // Retrieve user info from the session
  passport.deserializeUser((sessionUser: ISessionUser, done) => {
    User.findById(sessionUser._id)
      .then((user) => done(null, user))
      .catch((error) => done(error, null))
  })
}
