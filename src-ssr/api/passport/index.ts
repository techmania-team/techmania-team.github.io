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
    done(null, user.id)
  })

  // Retrieve user info from the session
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => done(null, user))
      .catch((error) => done(error, null))
  })
}
