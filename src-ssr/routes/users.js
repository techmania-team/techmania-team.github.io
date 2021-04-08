const express = require('express')
const { login, extend } = require('../controllers/users.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/login', login)
router.post('/extend', auth, extend)

module.exports = router
