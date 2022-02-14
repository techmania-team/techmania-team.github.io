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
const express = require('express')
const mongoose = require('mongoose')

const routerUsers = require('./routes/users.js')
const routerPatterns = require('./routes/patterns.js')
const routerSkins = require('./routes/skins.js')
const routerComments = require('./routes/comments.js')

require('dotenv').config()

module.exports.extendApp = function ({ app, ssr }) {
  mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

  app.set('trust proxy', 1)

  app.disable('x-powered-by')

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

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
}
