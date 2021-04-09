const express = require('express')
const { create, search } = require('../controllers/patterns.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, create)
router.get('/', search)

module.exports = router
