// Workaround of express-mongo-sanitize bug
// https://github.com/fiznool/express-mongo-sanitize/issues/202#issuecomment-4934723456

import type { NextFunction, Request, Response } from 'express'
import mongoSanitize from 'express-mongo-sanitize'

const sanitizeRequestTarget = (target: unknown): void => {
  if (target && typeof target === 'object') {
    mongoSanitize.sanitize(target as Record<string, unknown> | unknown[])
  }
}

export default (req: Request, res: Response, next: NextFunction) => {
  sanitizeRequestTarget(req.body)
  sanitizeRequestTarget(req.params)
  sanitizeRequestTarget(req.headers)
  sanitizeRequestTarget(req.query)
  next()
}
