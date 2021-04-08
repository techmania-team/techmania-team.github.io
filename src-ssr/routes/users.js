const express = require('express')
const { login } = require('../controllers/users.js')
const router = express.Router()

router.get('/login', login)

module.exports = router
