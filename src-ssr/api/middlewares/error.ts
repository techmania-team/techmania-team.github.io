import type { NextFunction, Response } from 'express'
import { type Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Error as MongooseError } from 'mongoose'
import yup from 'yup'
import { AppError } from '../utils/error'

export default (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (import.meta.env.QUASAR_DEV) {
    console.error(error)
  }

  if (error instanceof AppError) {
    switch (error.message) {
      case 'NOT_FOUND':
        res.status(StatusCodes.NOT_FOUND).send({ success: false, message: 'Not found' })
        break
      case 'PERMISSION':
        res.status(StatusCodes.FORBIDDEN).send({ success: false, message: 'Permission' })
        break
      case 'ALREADY_COMMENTED':
        res.status(StatusCodes.CONFLICT).send({ success: false, message: 'Already commented' })
        break
      case 'REPLY_NOT_FOUND':
        res.status(StatusCodes.NOT_FOUND).send({ success: false, message: 'Not found' })
        break
    }
  } else if (error instanceof yup.ValidationError) {
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message })
  } else if (
    error instanceof MongooseError.ValidationError ||
    error instanceof yup.ValidationError
  ) {
    res.status(StatusCodes.BAD_REQUEST).send({ success: false, message: 'Validation Failed' })
  } else if (
    error instanceof MongooseError.CastError ||
    error instanceof MongooseError.DocumentNotFoundError
  ) {
    res.status(StatusCodes.NOT_FOUND).send({ success: false, message: 'Not found' })
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ success: false, message: 'Server Error' })
  }
}
