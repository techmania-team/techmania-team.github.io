import express from 'express'
import mongoose from 'mongoose'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'

import routerUsers from './routes/users'
import routerPatterns from './routes/patterns'
import routerSkins from './routes/skins'
import routerComments from './routes/comments'
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
  } catch (error) {
    handleError(error)
    process.exit(1)
  }

  app.set('trust proxy', 1)

  app.disable('x-powered-by')

  app.use(limiter)

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use(mongoSanitize())

  app.use((error, req, res, next) => {
    if (error) return res.status(400).send({ success: false, message: 'Validation Failed' })
    else next()
  })

  app.use('/api/users', routerUsers)
  app.use('/api/patterns', routerPatterns)
  app.use('/api/skins', routerSkins)
  app.use('/api/comments', routerComments)
  app.use('/api/*', (req, res) => {
    res.status(404).send({ success: false, message: 'Not Found.' })
  })
}
