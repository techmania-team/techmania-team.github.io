const express = require('express')
const { pattern } = require('../controllers/meta.js')
const router = express.Router()

router.get('/pattern/:id', pattern)

module.exports = router
