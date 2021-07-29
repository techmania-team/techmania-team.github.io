const express = require('express')
const { login, extend, logout, verify } = require('../controllers/users.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/login', login)
router.post('/extend', auth, extend)
router.delete('/logout', auth, logout)
router.get('/verify', auth, verify)

module.exports = router
