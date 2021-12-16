const express = require('express')
const { create, getByPattern } = require('../controllers/comments.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, create)
router.get('/patterns/:id', getByPattern)

module.exports = router
