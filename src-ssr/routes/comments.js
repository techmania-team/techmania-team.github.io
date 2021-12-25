const express = require('express')
const { create, getByPattern, getMyCommmentByPattern, updateComment, createReply, updateReply, updateReplyVote } = require('../controllers/comments.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, create)
router.get('/patterns/:id/my', auth, getMyCommmentByPattern)
router.get('/patterns/:id', getByPattern)
router.patch('/:id', auth, updateComment)
router.post('/:cid/replies', auth, createReply)
router.patch('/:cid/replies/:rid', auth, updateReply)
router.patch('/:cid/replies/:rid/votes', auth, updateReplyVote)

module.exports = router
