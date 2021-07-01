/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Note: This file is used for both PRODUCTION & DEVELOPMENT.
 * Note: Changes to this file (but not any file it imports!) are picked up by the
 * development server, but such updates are costly since the dev-server needs a reboot.
 */
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const routerUsers = require('./routes/users.js')
const routerPatterns = require('./routes/patterns.js')
const routerMeta = require('./routes/meta.js')

module.exports.extendApp = function ({ app, ssr }) {
  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

  app.set('trust proxy', 1)

  app.use(bodyParser.json())

  app.use('/api/users', routerUsers)
  app.use('/api/patterns', routerPatterns)

  // fuck facebook and twitter crawler
  app.use('/api/meta', routerMeta)
  app.get('/patterns/:id', (req, res, next) => {
    console.log(req.headers['user-agent'])
    const agent = req.headers['user-agent']
    if ((agent.match(/facebook/gi) || agent.match(/twitter/gi) || agent.match(/discord/gi)) && req.originalUrl.includes('/patterns/')) {
      const data = req.originalUrl.split('/')
      res.redirect(new URL('/api/meta/pattern/' + data[2], process.env.HOST_URL))
    } else {
      next()
    }
  })
}
