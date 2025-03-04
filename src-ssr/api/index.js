import express from 'express'
import mongoose from 'mongoose'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import { initialize as passportInitialize } from './passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'

import routerUsers from './routes/users'
import routerPatterns from './routes/patterns'
import routerSkins from './routes/skins'
import routerComments from './routes/comments'
import routerAuth from './routes/auth'

import handleError from './utils/handleError'

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too Many Requests',
  statusCode: 429,
  handler(req, res, next, options) {
    res.status(options.statusCode).json({ success: false, message: options.message })
  },
})

export const initializeApi = async (app) => {
  try {
    await mongoose.connect(process.env.DB_URL)

    // Set up Express
    app.set('trust proxy', 1)
    app.disable('x-powered-by')

    // Set up rate limiter
    app.use(limiter)

    // Set up session
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: true,
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
      }),
    )

    // Set up body parser
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(mongoSanitize())
    // Hnadle body parser errors
    app.use((error, req, res, next) => {
      console.log(error)
      if (error) return res.status(400).send({ success: false, message: 'Validation Failed' })
      else next()
    })

    // Initialize Passport
    passportInitialize(app)

    // Set up routes
    app.use('/api/users', routerUsers)
    app.use('/api/patterns', routerPatterns)
    app.use('/api/skins', routerSkins)
    app.use('/api/comments', routerComments)
    app.use('/api/auth', routerAuth)
    app.use('/api/*', (req, res) => {
      res.status(404).send({ success: false, message: 'Not Found.' })
    })
  } catch (error) {
    handleError(error)
    process.exit(1)
  }
}
