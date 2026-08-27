import type { Express, NextFunction, Request, Response } from 'express'
import MongoStore from 'connect-mongo'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import middlewareError from './middlewares/error'
import middlewareMongoSanitize from './middlewares/mongo-sanitize'
import { initialize as passportInitialize } from './passport'
import routerAuth from './routes/auth'
import routerComments from './routes/comments'
import routerInfo from './routes/info'
import routerPatterns from './routes/patterns'
import routerSetlists from './routes/setlists'
import routerSkins from './routes/skins'
import routerUsers from './routes/users'

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

export const initializeApi = async (app: Express) => {
  try {
    await mongoose.connect(import.meta.env.DB_URL || '')

    // Set up Express
    app.set('trust proxy', 1)
    app.disable('x-powered-by')

    // Set up rate limiter
    app.use(limiter)

    // Set up session
    app.use(
      session({
        secret: import.meta.env.SESSION_SECRET || '',
        saveUninitialized: false,
        resave: true,
        store: MongoStore.create({ mongoUrl: import.meta.env.DB_URL || '' }),
        cookie: {
          secure: Boolean(import.meta.env.PROD || false),
          // 14 days, same as connect mongo default ttl
          // https://www.npmjs.com/package/connect-mongo#session-expiration
          maxAge: 14 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'lax',
        },
      }),
    )

    // Set up body parser
    app.use('/api', express.json())
    app.use('/api', express.urlencoded({ extended: true }))
    app.use('/api', middlewareMongoSanitize)

    // Handle body parser errors
    app.use('/api', (error: unknown, req: Request, res: Response, _next: NextFunction) => {
      console.error(error)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ success: false, message: 'Validation Failed' })
    })

    // Initialize Passport
    passportInitialize(app)

    // Set up routes
    app.use('/api/users', routerUsers)
    app.use('/api/patterns', routerPatterns)
    app.use('/api/skins', routerSkins)
    app.use('/api/setlists', routerSetlists)
    app.use('/api/comments', routerComments)
    app.use('/api/auth', routerAuth)
    app.use('/api/info', routerInfo)
    app.use('/api', (req, res) => {
      res.status(StatusCodes.NOT_FOUND).send({ success: false, message: 'Not Found.' })
    })
    app.use('/api', middlewareError)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
