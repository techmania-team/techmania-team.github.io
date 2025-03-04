import passport from 'passport'
import discord from './discord'
// import User from '../models/users'

export const initialize = (app) => {
  // Set up passport
  app.use('/api', passport.initialize())
  app.use('/api', passport.session())

  // Use Discord strategy
  passport.use('discord', discord)

  // Save user info to the session
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  // Retrieve user info from the session
  passport.deserializeUser((user, done) => {
    done(null, user)
  })
}
