const patterns = require('../models/patterns.js')

module.exports = {
  async pattern (req, res) {
    try {
      const result = await patterns.findById(req.params.id).populate('submitter', 'name').lean()
      if (result === null) {
        res.status(404).send({ success: false, message: 'Not found' })
      } else {
        const img = result.previews.length > 0 ? `http://i3.ytimg.com/vi/${result.previews[0].ytid}/hqdefault.jpg` : 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
        res.send(
          `
          <meta name="title" content="${result.name} | TECHMANIA">
          <meta name="description" content="TECHMANIA >> Patterns >>  ${result.name}">
          <meta name="og:type" content="website" data-dynamic="true" data-qmeta="ogType">
          <meta name="og:url" content="${new URL('/patterns/' + result._id, process.env.HOST_URL).toString()}">
          <meta name="og:title" content="${result.name} | TECHMANIA">
          <meta name="og:description" content="TECHMANIA >> Patterns >>  ${result.name}">
          <meta name="og:image" content="${img}">
          <meta name="twitter:title" content="${result.name} | TECHMANIA">
          <meta name="twitter:url" content="${new URL('/patterns/' + result._id, process.env.HOST_URL).toString()}">
          <meta name="twitter:description" content="TECHMANIA >> Patterns >> ${result.name}">
          `
        )
      }
    } catch (error) {
      res.status(500).send({ success: false, message: 'Server Error' })
    }
  }
}
