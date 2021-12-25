const express = require('express')
const { create, getByPattern, getMyCommmentByPattern, updateComment } = require('../controllers/comments.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, create)
router.get('/patterns/:id/my', auth, getMyCommmentByPattern)
router.get('/patterns/:id', getByPattern)
router.patch('/:id', auth, updateComment)

module.exports = router
