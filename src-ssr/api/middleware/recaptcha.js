import { RecaptchaV3 } from 'express-recaptcha'

const recaptcha = new RecaptchaV3(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)

export default async (req, res, next) => {
  recaptcha.verify(req, (error, data) => {
    if (!error && data.score >= 0.5) {
      next()
    } else {
      res.status(400).send({ success: false, message: 'Recaptcha Error' })
    }
  })
}
