const Recaptcha = require('express-recaptcha').RecaptchaV3

module.exports = async (req, res, next) => {
  const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)
  recaptcha.verify(req, (error, data) => {
    if (!error && data.score >= 0.5) {
      next()
    } else {
      res.status(400).send({ success: false, message: 'Recaptcha Error' })
    }
  })
}
