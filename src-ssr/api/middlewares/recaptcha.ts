import type { NextFunction, Request, Response } from 'express'
import { RecaptchaV3 } from 'express-recaptcha'
import { StatusCodes } from 'http-status-codes'

const recaptcha = new RecaptchaV3(
  import.meta.env.QCLI_RECAPTCHA_SITE_KEY,
  import.meta.env.RECAPTCHA_SECRET_KEY!,
)

export default (req: Request, res: Response, next: NextFunction) => {
  recaptcha.verify(req, (error, data) => {
    if (!error && data && data.score >= 0.5) {
      next()
    } else {
      res.status(StatusCodes.BAD_REQUEST).send({ success: false, message: 'Recaptcha Error' })
    }
  })
}
