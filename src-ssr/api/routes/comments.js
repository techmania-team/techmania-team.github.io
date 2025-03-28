import express from 'express'
import {
  create,
  getByPattern,
  getMyCommmentByPattern,
  getBySkin,
  getMyCommmentBySkin,
  updateMyComment,
  createReply,
  updateMyReply,
  updateReplyVote,
  getByUser,
} from '../controllers/comments.js'
import { isAuthenticated } from '../middleware/auth'
import recaptcha from '../middleware/recaptcha'

const router = express.Router()

// Params description:
// pid = pattern id
// sid = skin id
// setid = setlist id
// uid = user id
// cid = comment id
// rid = reply id
router.post('/', recaptcha, isAuthenticated, create)
router.get('/pattern/:pid/my', isAuthenticated, getMyCommmentByPattern)
router.get('/pattern/:pid', getByPattern)
router.get('/skin/:sid/my', isAuthenticated, getMyCommmentBySkin)
router.get('/skin/:sid', getBySkin)
router.get('/setlist/:setid/my', isAuthenticated, getMyCommmentByPattern)
router.get('/setlist/:setid', getByPattern)
router.get('/user/:uid', getByUser)
router.patch('/:cid', recaptcha, isAuthenticated, updateMyComment)
router.post('/:cid/replies', recaptcha, isAuthenticated, createReply)
router.patch('/:cid/replies/:rid', recaptcha, isAuthenticated, updateMyReply)
router.patch('/:cid/replies/:rid/votes', recaptcha, isAuthenticated, updateReplyVote)

export default router
