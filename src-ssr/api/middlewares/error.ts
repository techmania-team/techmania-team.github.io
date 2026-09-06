import type { NextFunction, Response } from 'express'
import { type Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Error as MongooseError } from 'mongoose'
import yup from 'yup'
import { AppError } from '../utils/error'

export default (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  // The recognised errors below are ordinary control flow, so they are only
  // worth printing while developing
  if (import.meta.env.QUASAR_DEV) {
    console.error(error)
  }

  if (error instanceof AppError) {
    switch (error.message) {
      case 'NOT_FOUND':
      case 'REPLY_NOT_FOUND':
        res.status(StatusCodes.NOT_FOUND).send({ success: false, message: 'Not found' })
        return
      case 'PERMISSION':
        res.status(StatusCodes.FORBIDDEN).send({ success: false, message: 'Permission' })
        return
      case 'FORBIDDEN':
        res.status(StatusCodes.FORBIDDEN).send({ success: false, message: 'Forbidden' })
        return
      case 'BAD_REQUEST':
        res.status(StatusCodes.BAD_REQUEST).send({ success: false, message: 'Bad request' })
        return
      case 'ALREADY_COMMENTED':
        res.status(StatusCodes.CONFLICT).send({ success: false, message: 'Already commented' })
        return
    }
    // An AppError nobody wrote a case for falls through to the bottom, so it
    // still gets an answer instead of leaving the request open forever
  } else if (error instanceof yup.ValidationError) {
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message })
    return
  } else if (error instanceof MongooseError.ValidationError) {
    res.status(StatusCodes.BAD_REQUEST).send({ success: false, message: 'Validation Failed' })
    return
  } else if (
    error instanceof MongooseError.CastError ||
    error instanceof MongooseError.DocumentNotFoundError
  ) {
    res.status(StatusCodes.NOT_FOUND).send({ success: false, message: 'Not found' })
    return
  }

  // Nothing above recognised it. Log this one in production too: a 500 that
  // leaves no trace is the hardest kind to chase on a dyno.
  if (!import.meta.env.QUASAR_DEV) {
    console.error(`[api] ${req.method} ${req.originalUrl}`, error)
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Server Error' })
}
