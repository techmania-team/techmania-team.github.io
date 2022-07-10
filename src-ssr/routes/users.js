const express = require('express')
const { login, extend, logout, verify, getById, getAvatarById } = require('../controllers/users.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.get('/login', login)
router.post('/extend', auth, extend)
router.delete('/logout', auth, logout)
router.get('/verify', auth, verify)
router.get('/avatar/:id', getAvatarById)
router.get('/:id', getById)

module.exports = router
