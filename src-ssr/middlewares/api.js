import { ssrMiddleware } from 'quasar/wrappers'

import express from 'express'
import mongoose from 'mongoose'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'

import routerUsers from '../routes/users'
import routerPatterns from '../routes/patterns'
import routerSkins from '../routes/skins'
import routerComments from '../routes/comments'

export default ssrMiddleware(({ app }) => {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    handler (req, res, next, options) {
      res.status(429).json({ success: false, message: 'Too Many Requests' })
    }
  })

  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

  app.set('trust proxy', 1)

  app.disable('x-powered-by')

  app.use(limiter)

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use(mongoSanitize())

  app.use((_, req, res, next) => {
    res.status(400).send({ success: false, message: 'Validation Failed' })
  })

  app.use('/api/users', routerUsers)
  app.use('/api/patterns', routerPatterns)
  app.use('/api/skins', routerSkins)
  app.use('/api/comments', routerComments)
  app.use('/api/*', (req, res) => {
    res.status(404).send({ success: false, message: 'Not Found.' })
  })
})
